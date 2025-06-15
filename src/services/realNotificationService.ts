
import { supabase } from "@/integrations/supabase/client";
import { dataService } from "./dataService";
import { smsService } from "./smsService";

export interface RealNotification {
  id: string;
  type: 'irrigation_due' | 'irrigation_overdue' | 'weather_alert' | 'system_alert' | 'soil_moisture_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  farmId?: string;
  scheduleId?: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  actionData?: any;
}

class RealNotificationService {
  private notifications: RealNotification[] = [];
  private listeners: ((notifications: RealNotification[]) => void)[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadNotifications();
    this.requestNotificationPermission();
    this.startRealTimeChecks();
  }

  // Subscribe to notification updates
  subscribe(callback: (notifications: RealNotification[]) => void) {
    this.listeners.push(callback);
    callback(this.notifications);
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Request browser notification permission
  private requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // Add new notification
  addNotification(notification: Omit<RealNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: RealNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.notifyListeners();

    // Send browser notification for important alerts
    if (notification.priority === 'high' || notification.priority === 'critical') {
      this.sendBrowserNotification(notification.title, notification.message);
    }

    return newNotification;
  }

  // Send browser notification
  private sendBrowserNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }

  // Check for due irrigations from Supabase
  private async checkDueIrrigations() {
    try {
      const { data: schedules, error } = await supabase
        .from('irrigation_schedules')
        .select(`
          *,
          farms (name, location, farmer_id),
          crops (name)
        `)
        .eq('is_active', true);

      if (error) throw error;

      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      for (const schedule of schedules || []) {
        const nextIrrigation = new Date(schedule.next_irrigation);
        
        // Check if irrigation is due within the next hour
        if (nextIrrigation <= oneHourFromNow && nextIrrigation > now) {
          const existingNotification = this.notifications.find(
            n => n.scheduleId === schedule.id && 
            n.type === 'irrigation_due' && 
            !n.read &&
            new Date(n.timestamp).toDateString() === now.toDateString()
          );

          if (!existingNotification) {
            const minutesUntil = Math.round((nextIrrigation.getTime() - now.getTime()) / (1000 * 60));
            
            if (schedule.farms?.farmer_id) {
              this.sendIrrigationSms(schedule, 'due', { minutesUntil });
            }
            
            this.addNotification({
              type: 'irrigation_due',
              title: 'Irrigation Due Soon',
              message: `${schedule.farms.name} - ${schedule.crops.name} needs irrigation in ${minutesUntil} minutes. Duration: ${schedule.duration} minutes.`,
              priority: 'high',
              farmId: schedule.farm_id,
              scheduleId: schedule.id,
              actionRequired: true,
              actionData: {
                farmName: schedule.farms.name,
                cropName: schedule.crops.name,
                duration: schedule.duration,
                scheduledTime: schedule.best_time
              }
            });
          }
        }

        // Check for overdue irrigations
        if (nextIrrigation < now) {
          const existingOverdueNotification = this.notifications.find(
            n => n.scheduleId === schedule.id && 
            n.type === 'irrigation_overdue' && 
            !n.read
          );

          if (!existingOverdueNotification) {
            const hoursOverdue = Math.round((now.getTime() - nextIrrigation.getTime()) / (1000 * 60 * 60));
            
            if (schedule.farms?.farmer_id) {
              this.sendIrrigationSms(schedule, 'overdue', { hoursOverdue });
            }
            
            this.addNotification({
              type: 'irrigation_overdue',
              title: 'Overdue Irrigation',
              message: `${schedule.farms.name} - ${schedule.crops.name} irrigation is ${hoursOverdue} hours overdue. Immediate action required.`,
              priority: 'critical',
              farmId: schedule.farm_id,
              scheduleId: schedule.id,
              actionRequired: true,
              actionData: {
                farmName: schedule.farms.name,
                cropName: schedule.crops.name,
                hoursOverdue,
                originalTime: schedule.best_time
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking due irrigations:', error);
    }
  }

  private async sendIrrigationSms(schedule: any, type: 'due' | 'overdue', details: { minutesUntil?: number, hoursOverdue?: number }) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', schedule.farms.farmer_id)
        .single();

      if (profileError) {
        console.error(`Error fetching profile for SMS for farmer ${schedule.farms.farmer_id}:`, profileError);
        return;
      }

      if (profile?.phone) {
        let smsMessage = '';
        if (type === 'due') {
          smsMessage = `AquaWise Reminder: Irrigation for ${schedule.crops.name} at ${schedule.farms.name} is due in ${details.minutesUntil} minutes.`;
        } else {
          smsMessage = `AquaWise Alert: Irrigation for ${schedule.crops.name} at ${schedule.farms.name} is ${details.hoursOverdue} hours overdue. Please attend to it.`;
        }

        const result = await smsService.sendSms(profile.phone, smsMessage);
        if (result.success) {
          console.log(`Irrigation SMS reminder sent to ${profile.phone}`);
        } else {
          console.error(`Failed to send irrigation SMS to ${profile.phone}: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error in sendIrrigationSms:', error);
    }
  }

  // Mark irrigation as completed
  async markIrrigationCompleted(scheduleId: string, waterUsed: number, notes?: string) {
    try {
      // Get the schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from('irrigation_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

      if (scheduleError) throw scheduleError;

      // Log the irrigation
      const { error: logError } = await supabase
        .from('irrigation_logs')
        .insert({
          schedule_id: scheduleId,
          farm_id: schedule.farm_id,
          irrigation_date: new Date().toISOString(),
          duration: schedule.duration,
          water_used: waterUsed,
          completed: true,
          notes: notes || ''
        });

      if (logError) throw logError;

      // Calculate next irrigation date
      const nextIrrigation = new Date();
      nextIrrigation.setDate(nextIrrigation.getDate() + schedule.frequency);
      
      // Set the time from best_time
      const [hours, minutes] = schedule.best_time.split(':').map(Number);
      nextIrrigation.setHours(hours, minutes, 0, 0);

      // Update the schedule
      const { error: updateError } = await supabase
        .from('irrigation_schedules')
        .update({ next_irrigation: nextIrrigation.toISOString() })
        .eq('id', scheduleId);

      if (updateError) throw updateError;

      // Mark related notifications as read
      this.notifications
        .filter(n => n.scheduleId === scheduleId && !n.read)
        .forEach(n => n.read = true);

      this.saveNotifications();
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('Error marking irrigation as completed:', error);
      return false;
    }
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

  // Start real-time monitoring
  private startRealTimeChecks() {
    // Check every 5 minutes for due irrigations
    this.checkInterval = setInterval(async () => {
      await this.checkDueIrrigations();
      this.clearOldNotifications();
    }, 5 * 60 * 1000);

    // Initial check after 2 seconds
    setTimeout(async () => {
      await this.checkDueIrrigations();
    }, 2000);
  }

  // Clear old notifications (older than 30 days)
  private clearOldNotifications() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    const originalLength = this.notifications.length;
    this.notifications = this.notifications.filter(
      n => new Date(n.timestamp) > cutoffDate
    );
    
    if (this.notifications.length !== originalLength) {
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Stop monitoring
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
    const stored = localStorage.getItem('aquawise_real_notifications');
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
    localStorage.setItem('aquawise_real_notifications', JSON.stringify(this.notifications));
  }
}

export const realNotificationService = new RealNotificationService();

