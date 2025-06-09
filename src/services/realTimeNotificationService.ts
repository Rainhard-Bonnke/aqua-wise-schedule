
import { dataService, IrrigationSchedule, Farm } from "./dataService";
import { weatherService } from "./weatherService";
import { notificationService } from "./notificationService";

export interface Notification {
  id: string;
  type: 'irrigation' | 'weather' | 'system' | 'reminder' | 'alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  farmId?: string;
  scheduleId?: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  actionUrl?: string;
}

class RealTimeNotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadNotifications();
    this.startRealTimeChecks();
  }

  // Subscribe to notification updates
  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback);
    callback(this.notifications);
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Add new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.notifyListeners();

    // Send browser notification for high priority
    if (notification.priority === 'high' || notification.priority === 'critical') {
      notificationService.sendNotification(notification.title, notification.message);
    }

    return newNotification;
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Mark all as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Get notifications by type
  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Get notifications by farm
  getNotificationsByFarm(farmId: string): Notification[] {
    return this.notifications.filter(n => n.farmId === farmId);
  }

  // Clear old notifications (older than 30 days)
  clearOldNotifications() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    this.notifications = this.notifications.filter(
      n => new Date(n.timestamp) > cutoffDate
    );
    
    this.saveNotifications();
    this.notifyListeners();
  }

  // Real-time checks for irrigation schedules
  private async checkUpcomingIrrigations() {
    const schedules = dataService.getSchedules();
    const farms = dataService.getFarms();
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    for (const schedule of schedules) {
      if (!schedule.isActive) continue;

      const nextIrrigation = new Date(schedule.nextIrrigation);
      const farm = farms.find(f => f.id === schedule.farmId);

      // Check if irrigation is due within the next hour
      if (nextIrrigation <= oneHourFromNow && nextIrrigation > now) {
        const existingNotification = this.notifications.find(
          n => n.scheduleId === schedule.id && 
          n.type === 'irrigation' && 
          !n.read &&
          new Date(n.timestamp).toDateString() === now.toDateString()
        );

        if (!existingNotification) {
          this.addNotification({
            type: 'irrigation',
            title: 'Irrigation Due Soon',
            message: `Irrigation scheduled for ${farm?.name || 'Farm'} in ${Math.round((nextIrrigation.getTime() - now.getTime()) / (1000 * 60))} minutes`,
            priority: 'high',
            farmId: schedule.farmId,
            scheduleId: schedule.id,
            actionRequired: true,
            actionUrl: `/irrigation/${schedule.id}`
          });
        }
      }

      // Check for overdue irrigations
      if (nextIrrigation < now) {
        const existingOverdueNotification = this.notifications.find(
          n => n.scheduleId === schedule.id && 
          n.type === 'alert' && 
          !n.read &&
          n.message.includes('overdue')
        );

        if (!existingOverdueNotification) {
          this.addNotification({
            type: 'alert',
            title: 'Overdue Irrigation',
            message: `Irrigation for ${farm?.name || 'Farm'} is overdue by ${Math.round((now.getTime() - nextIrrigation.getTime()) / (1000 * 60 * 60))} hours`,
            priority: 'critical',
            farmId: schedule.farmId,
            scheduleId: schedule.id,
            actionRequired: true
          });
        }
      }
    }
  }

  // Check weather alerts
  private async checkWeatherAlerts() {
    const farms = dataService.getFarms();
    
    for (const farm of farms) {
      try {
        const weather = await weatherService.getCurrentWeather(farm.location);
        
        // Check for heavy rain (> 10mm)
        if (weather.rainfall > 10) {
          const existingRainAlert = this.notifications.find(
            n => n.farmId === farm.id && 
            n.type === 'weather' && 
            !n.read &&
            n.message.includes('heavy rain') &&
            new Date(n.timestamp).toDateString() === new Date().toDateString()
          );

          if (!existingRainAlert) {
            this.addNotification({
              type: 'weather',
              title: 'Heavy Rain Alert',
              message: `Heavy rain (${weather.rainfall}mm) detected at ${farm.name}. Consider postponing irrigation.`,
              priority: 'medium',
              farmId: farm.id
            });
          }
        }

        // Check for extreme temperatures
        if (weather.temperature > 35) {
          const existingHeatAlert = this.notifications.find(
            n => n.farmId === farm.id && 
            n.type === 'weather' && 
            !n.read &&
            n.message.includes('high temperature') &&
            new Date(n.timestamp).toDateString() === new Date().toDateString()
          );

          if (!existingHeatAlert) {
            this.addNotification({
              type: 'weather',
              title: 'High Temperature Alert',
              message: `High temperature (${weather.temperature}°C) at ${farm.name}. Increase irrigation frequency.`,
              priority: 'medium',
              farmId: farm.id
            });
          }
        }

      } catch (error) {
        console.error(`Weather check failed for farm ${farm.id}:`, error);
      }
    }
  }

  // System health checks
  private checkSystemHealth() {
    const farms = dataService.getFarms();
    const schedules = dataService.getSchedules();
    
    // Check for farms without schedules
    const farmsWithoutSchedules = farms.filter(farm => 
      !schedules.some(schedule => schedule.farmId === farm.id && schedule.isActive)
    );

    farmsWithoutSchedules.forEach(farm => {
      const existingAlert = this.notifications.find(
        n => n.farmId === farm.id && 
        n.type === 'system' && 
        !n.read &&
        n.message.includes('no irrigation schedule')
      );

      if (!existingAlert) {
        this.addNotification({
          type: 'system',
          title: 'No Irrigation Schedule',
          message: `${farm.name} has no active irrigation schedule. Create one to optimize water usage.`,
          priority: 'medium',
          farmId: farm.id,
          actionRequired: true
        });
      }
    });
  }

  // Start real-time monitoring
  private startRealTimeChecks() {
    // Check every 5 minutes
    this.checkInterval = setInterval(async () => {
      await this.checkUpcomingIrrigations();
      await this.checkWeatherAlerts();
      this.checkSystemHealth();
      this.clearOldNotifications();
    }, 5 * 60 * 1000);

    // Initial check
    setTimeout(async () => {
      await this.checkUpcomingIrrigations();
      await this.checkWeatherAlerts();
      this.checkSystemHealth();
    }, 1000);
  }

  // Stop real-time monitoring
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Load notifications from storage
  private loadNotifications() {
    const stored = localStorage.getItem('aquawise_notifications');
    if (stored) {
      try {
        this.notifications = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        this.notifications = [];
      }
    }
  }

  // Save notifications to storage
  private saveNotifications() {
    localStorage.setItem('aquawise_notifications', JSON.stringify(this.notifications));
  }

  // Generate demo notifications for testing
  generateDemoNotifications() {
    const demoNotifications = [
      {
        type: 'irrigation' as const,
        title: 'Irrigation Reminder',
        message: 'Tomato field irrigation scheduled in 30 minutes',
        priority: 'high' as const
      },
      {
        type: 'weather' as const,
        title: 'Weather Update',
        message: 'Rain expected tomorrow. Consider adjusting irrigation schedule.',
        priority: 'medium' as const
      },
      {
        type: 'system' as const,
        title: 'System Update',
        message: 'AquaWise system updated with new features',
        priority: 'low' as const
      }
    ];

    demoNotifications.forEach(notification => {
      this.addNotification(notification);
    });
  }
}

export const realTimeNotificationService = new RealTimeNotificationService();
