
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { smsService } from "@/services/smsService";

interface SmsSetupProps {
  initialPhone: string;
}

const SmsSetup = ({ initialPhone }: SmsSetupProps) => {
  const { toast } = useToast();
  const [testPhone, setTestPhone] = useState(initialPhone);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleTestSMS = async () => {
    if (!testPhone) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to test SMS notifications.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingTest(true);
    try {
      // Log the payload being sent
      console.log("Sending SMS payload:", {
        to: testPhone,
        message: "Welcome to AquaWise! Your SMS notifications are successfully set up."
      });

      const result = await smsService.sendSms(
        testPhone,
        "Welcome to AquaWise! Your SMS notifications are successfully set up."
      );

      if (result.success) {
        toast({
          title: "Test SMS Sent!",
          description: "Check your phone for a confirmation message. Real SMS alerts are now active.",
        });
      } else {
        toast({
          title: "SMS Failed",
          description: result.error || "Could not send test SMS. Please check your phone number and Twilio setup.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to send test SMS:", error);
      toast({
        title: "SMS Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="h-5 w-5 mr-2 text-blue-500" />
          SMS Reminders Setup
        </CardTitle>
        <CardDescription>Never miss an irrigation schedule</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">📱 Stay Connected</h4>
          <p className="text-blue-700 text-sm mb-3">
            Get SMS reminders for irrigation schedules, weather alerts, and farming tips 
            directly on your phone - even when you're offline!
          </p>
          <div className="flex items-center text-blue-600 text-sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Free SMS notifications
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Confirm Your Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+254 XXX XXX XXX"
            />
          </div>

          <Button 
            onClick={handleTestSMS}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSendingTest}
          >
            {isSendingTest ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Phone className="h-4 w-4 mr-2" />
            )}
            {isSendingTest ? "Sending..." : "Send Test SMS"}
          </Button>
        </div>

        <div className="border-t pt-4">
          <h5 className="font-medium text-gray-900 mb-2">You'll receive reminders for:</h5>
          <div className="space-y-1 text-sm text-gray-600">
            <p>• Irrigation schedules (15 min before)</p>
            <p>• Weather alerts and warnings</p>
            <p>• Maintenance reminders</p>
            <p>• Harvest time notifications</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmsSetup;
