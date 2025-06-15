// Notification service for SMS and email simulation
import { smsService } from './smsService';

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

  scheduleIrrigationReminder(
    farmId: string, 
    scheduledTime: string, 
    cropName: string,
    farmerData?: { name: string; phone: string }
  ): void {
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

    // SMS functionality was here, removed because smsService is obsolete.
    if (farmerData) {
      // This block is kept for potential future use, but smsService is removed.
    }
  }

  scheduleWeatherAlert(
    farmId: string, 
    weatherCondition: string,
    farmerData?: { name: string; phone: string }
  ): void {
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

    // SMS functionality was here, removed because smsService is obsolete.
    if (farmerData) {
      // This block is kept for potential future use, but smsService is removed.
    }
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

  // Made public and updated signature to match usage in realTimeNotificationService
  sendNotification(title: string, message: string): void;
  sendNotification(notification: Notification): void;
  sendNotification(titleOrNotification: string | Notification, message?: string): void {
    let notificationObj: Notification;
    
    if (typeof titleOrNotification === 'string') {
      // Handle the case where it's called with title and message
      console.log(`📱 SMS/Email Notification: ${titleOrNotification}`);
      console.log(`📧 Message: ${message}`);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(titleOrNotification, {
          body: message,
          icon: '/favicon.ico'
        });
      }
      return;
    } else {
      // Handle the case where it's called with notification object
      notificationObj = titleOrNotification;
    }

    // Simulate sending notification
    console.log(`📱 SMS/Email Notification: ${notificationObj.title}`);
    console.log(`📧 Message: ${notificationObj.message}`);
    
    // In a real app, this would integrate with Twilio, SendGrid, etc.
    notificationObj.sent = true;
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notificationObj.title, {
        body: notificationObj.message,
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
