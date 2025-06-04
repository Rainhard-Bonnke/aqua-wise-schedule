
// Notification service for SMS and email simulation
export interface NotificationPreferences {
  sms: boolean;
  email: boolean;
  push: boolean;
}

export interface Notification {
  id: string;
  type: 'irrigation' | 'weather' | 'maintenance' | 'harvest';
  title: string;
  message: string;
  scheduled: string;
  sent: boolean;
  farmId: string;
}

class NotificationService {
  private notifications: Notification[] = [];

  scheduleIrrigationReminder(farmId: string, scheduledTime: string, cropName: string): void {
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'irrigation',
      title: 'Irrigation Reminder',
      message: `Time to irrigate your ${cropName}. Check weather conditions before proceeding.`,
      scheduled: scheduledTime,
      sent: false,
      farmId
    };

    this.notifications.push(notification);
    this.scheduleNotification(notification);
  }

  scheduleWeatherAlert(farmId: string, weatherCondition: string): void {
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'weather',
      title: 'Weather Alert',
      message: `Weather update: ${weatherCondition}. Consider adjusting your irrigation schedule.`,
      scheduled: new Date().toISOString(),
      sent: false,
      farmId
    };

    this.notifications.push(notification);
    this.sendNotification(notification);
  }

  private scheduleNotification(notification: Notification): void {
    const scheduledTime = new Date(notification.scheduled);
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(() => {
        this.sendNotification(notification);
      }, delay);
    }
  }

  private sendNotification(notification: Notification): void {
    // Simulate sending notification
    console.log(`📱 SMS/Email Notification: ${notification.title}`);
    console.log(`📧 Message: ${notification.message}`);
    
    // In a real app, this would integrate with Twilio, SendGrid, etc.
    notification.sent = true;
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  }

  requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  getNotifications(farmId?: string): Notification[] {
    if (farmId) {
      return this.notifications.filter(n => n.farmId === farmId);
    }
    return this.notifications;
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.sent = true;
    }
  }
}

export const notificationService = new NotificationService();
