
import { supabase } from "@/integrations/supabase/client";

class SmsService {
  async sendSms(to: string, message: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { to, message },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
         throw new Error(data.error);
      }
      
      console.log('SMS sent successfully via edge function:', data);
      return { success: true };
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      const errorMessage = error.context?.errorMessage || error.message || "An unknown error occurred while sending SMS.";
      return { success: false, error: errorMessage };
    }
  }
}

export const smsService = new SmsService();
