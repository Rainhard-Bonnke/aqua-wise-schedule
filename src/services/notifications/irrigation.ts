
import { supabase } from "@/integrations/supabase/client";
import { smsService } from "@/services/smsService";
import { NotificationStore } from "./store";

export class IrrigationService {
  constructor(private notificationStore: NotificationStore) {}

  async checkDueIrrigations() {
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
      const notifications = this.notificationStore.getNotifications();

      for (const schedule of schedules || []) {
        const nextIrrigation = new Date(schedule.next_irrigation);
        
        if (nextIrrigation <= oneHourFromNow && nextIrrigation > now) {
          const existingNotification = notifications.find(
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
            
            this.notificationStore.addNotification({
              type: 'irrigation_due',
              title: 'Irrigation Due Soon',
              message: `${schedule.farms.name} - ${schedule.crops.name} needs irrigation in ${minutesUntil} minutes. Duration: ${schedule.duration} minutes.`,
              priority: 'high',
              farmId: schedule.farm_id,
              scheduleId: schedule.id,
              actionRequired: true,
              actionData: { farmName: schedule.farms.name, cropName: schedule.crops.name, duration: schedule.duration, scheduledTime: schedule.best_time }
            });
          }
        }

        if (nextIrrigation < now) {
          const existingOverdueNotification = notifications.find(
            n => n.scheduleId === schedule.id && n.type === 'irrigation_overdue' && !n.read
          );

          if (!existingOverdueNotification) {
            const hoursOverdue = Math.round((now.getTime() - nextIrrigation.getTime()) / (1000 * 60 * 60));
            
            if (schedule.farms?.farmer_id) {
              this.sendIrrigationSms(schedule, 'overdue', { hoursOverdue });
            }
            
            this.notificationStore.addNotification({
              type: 'irrigation_overdue',
              title: 'Overdue Irrigation',
              message: `${schedule.farms.name} - ${schedule.crops.name} irrigation is ${hoursOverdue} hours overdue. Immediate action required.`,
              priority: 'critical',
              farmId: schedule.farm_id,
              scheduleId: schedule.id,
              actionRequired: true,
              actionData: { farmName: schedule.farms.name, cropName: schedule.crops.name, hoursOverdue, originalTime: schedule.best_time }
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

  async markIrrigationCompleted(scheduleId: string, waterUsed: number, notes?: string) {
    try {
      const { data: schedule, error: scheduleError } = await supabase
        .from('irrigation_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();
      if (scheduleError) throw scheduleError;

      const { error: logError } = await supabase
        .from('irrigation_logs')
        .insert({
          schedule_id: scheduleId, farm_id: schedule.farm_id, irrigation_date: new Date().toISOString(),
          duration: schedule.duration, water_used: waterUsed, completed: true, notes: notes || ''
        });
      if (logError) throw logError;

      const nextIrrigation = new Date();
      nextIrrigation.setDate(nextIrrigation.getDate() + schedule.frequency);
      const [hours, minutes] = schedule.best_time.split(':').map(Number);
      nextIrrigation.setHours(hours, minutes, 0, 0);

      const { error: updateError } = await supabase
        .from('irrigation_schedules')
        .update({ next_irrigation: nextIrrigation.toISOString() })
        .eq('id', scheduleId);
      if (updateError) throw updateError;

      this.notificationStore.markScheduleNotificationsAsRead(scheduleId);

      return true;
    } catch (error) {
      console.error('Error marking irrigation as completed:', error);
      return false;
    }
  }
}
