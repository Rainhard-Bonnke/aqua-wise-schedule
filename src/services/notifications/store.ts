
import { RealNotification } from './types';

export class NotificationStore {
  private notifications: RealNotification[] = [];
  private listeners: ((notifications: RealNotification[]) => void)[] = [];

  constructor() {
    this.loadNotifications();
    this.requestNotificationPermission();
  }

  subscribe(callback: (notifications: RealNotification[]) => void) {
    this.listeners.push(callback);
    callback(this.notifications);
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  addNotification(notification: Omit<RealNotification, 'id' | 'timestamp' | 'read'>): RealNotification {
    const newNotification: RealNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.notifyListeners();

    if (notification.priority === 'high' || notification.priority === 'critical') {
      this.sendBrowserNotification(notification.title, notification.message);
    }

    return newNotification;
  }

  private sendBrowserNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }
  
  markScheduleNotificationsAsRead(scheduleId: string) {
    this.notifications
      .filter(n => n.scheduleId === scheduleId && !n.read)
      .forEach(n => n.read = true);
    this.saveNotifications();
    this.notifyListeners();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getNotifications(): RealNotification[] {
    return this.notifications;
  }

  clearOldNotifications() {
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

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

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

  private saveNotifications() {
    localStorage.setItem('aquawise_real_notifications', JSON.stringify(this.notifications));
  }
}
