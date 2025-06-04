
// SMS Service for sending irrigation reminders
export interface SMSReminder {
  id: string;
  farmerId: string;
  farmerName: string;
  phoneNumber: string;
  cropName: string;
  scheduledTime: string;
  message: string;
  sent: boolean;
  createdAt: string;
}

class SMSService {
  private reminders: SMSReminder[] = [];

  scheduleIrrigationReminder(
    farmerId: string, 
    farmerName: string,
    phoneNumber: string, 
    cropName: string, 
    scheduledTime: string
  ): void {
    const reminder: SMSReminder = {
      id: Date.now().toString(),
      farmerId,
      farmerName,
      phoneNumber,
      cropName,
      scheduledTime,
      message: `Hello ${farmerName}! 🌱 Time to irrigate your ${cropName}. Check weather conditions and start irrigation as scheduled. - AquaWise`,
      sent: false,
      createdAt: new Date().toISOString()
    };

    this.reminders.push(reminder);
    this.scheduleReminder(reminder);
    
    console.log(`📱 SMS reminder scheduled for ${farmerName} at ${phoneNumber}`);
  }

  scheduleWeatherAlert(
    farmerId: string,
    farmerName: string, 
    phoneNumber: string, 
    weatherCondition: string
  ): void {
    const reminder: SMSReminder = {
      id: Date.now().toString(),
      farmerId,
      farmerName,
      phoneNumber,
      cropName: 'All Crops',
      scheduledTime: new Date().toISOString(),
      message: `Hello ${farmerName}! 🌤️ Weather Alert: ${weatherCondition}. Consider adjusting your irrigation schedule. - AquaWise`,
      sent: false,
      createdAt: new Date().toISOString()
    };

    this.reminders.push(reminder);
    this.sendSMS(reminder);
  }

  private scheduleReminder(reminder: SMSReminder): void {
    const scheduledTime = new Date(reminder.scheduledTime);
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    // Schedule for 15 minutes before irrigation time
    const reminderTime = delay - (15 * 60 * 1000);

    if (reminderTime > 0) {
      setTimeout(() => {
        this.sendSMS(reminder);
      }, reminderTime);
    } else {
      // If time has passed, send immediately
      this.sendSMS(reminder);
    }
  }

  private sendSMS(reminder: SMSReminder): void {
    // Simulate SMS sending (in real app, integrate with Twilio, Africa's Talking, etc.)
    console.log(`📱 SMS SENT to ${reminder.phoneNumber}:`);
    console.log(`Message: ${reminder.message}`);
    
    reminder.sent = true;
    
    // Show notification in browser as well
    if (Notification.permission === 'granted') {
      new Notification('SMS Reminder Sent', {
        body: `Irrigation reminder sent to ${reminder.farmerName}`,
        icon: '/favicon.ico'
      });
    }

    // In a real application, you would call your SMS API here:
    // await fetch('/api/send-sms', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     to: reminder.phoneNumber,
    //     message: reminder.message
    //   })
    // });
  }

  getReminders(farmerId?: string): SMSReminder[] {
    if (farmerId) {
      return this.reminders.filter(r => r.farmerId === farmerId);
    }
    return this.reminders;
  }

  getReminderStats(): { total: number; sent: number; pending: number } {
    const total = this.reminders.length;
    const sent = this.reminders.filter(r => r.sent).length;
    const pending = total - sent;
    
    return { total, sent, pending };
  }

  // Test SMS functionality
  sendTestSMS(phoneNumber: string, farmerName: string): void {
    const testReminder: SMSReminder = {
      id: `test-${Date.now()}`,
      farmerId: 'test',
      farmerName,
      phoneNumber,
      cropName: 'Test Crop',
      scheduledTime: new Date().toISOString(),
      message: `Hello ${farmerName}! 🧪 This is a test message from AquaWise Scheduler. SMS notifications are working! - AquaWise`,
      sent: false,
      createdAt: new Date().toISOString()
    };

    this.sendSMS(testReminder);
  }
}

export const smsService = new SMSService();
