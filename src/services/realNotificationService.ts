
import { NotificationStore } from './notifications/store';
import { IrrigationService } from './notifications/irrigation';
import { RealNotification } from './notifications/types';

export type { RealNotification };

class RealNotificationService {
  private notificationStore: NotificationStore;
  private irrigationService: IrrigationService;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.notificationStore = new NotificationStore();
    this.irrigationService = new IrrigationService(this.notificationStore);
    this.startRealTimeChecks();
  }

  addNotification(notification: Omit<RealNotification, 'id' | 'timestamp' | 'read'>): RealNotification {
    return this.notificationStore.addNotification(notification);
  }

  subscribe(callback: (notifications: RealNotification[]) => void) {
    return this.notificationStore.subscribe(callback);
  }

  markAsRead(notificationId: string) {
    this.notificationStore.markAsRead(notificationId);
  }

  markAllAsRead() {
    this.notificationStore.markAllAsRead();
  }

  getUnreadCount(): number {
    return this.notificationStore.getUnreadCount();
  }
  
  async markIrrigationCompleted(scheduleId: string, waterUsed: number, notes?: string) {
    return this.irrigationService.markIrrigationCompleted(scheduleId, waterUsed, notes);
  }

  private startRealTimeChecks() {
    this.checkInterval = setInterval(async () => {
      await this.irrigationService.checkDueIrrigations();
      this.notificationStore.clearOldNotifications();
    }, 5 * 60 * 1000);

    setTimeout(async () => {
      await this.irrigationService.checkDueIrrigations();
    }, 2000);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const realNotificationService = new RealNotificationService();
