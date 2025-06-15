
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
