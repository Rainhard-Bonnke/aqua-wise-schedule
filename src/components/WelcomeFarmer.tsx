import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Sun, Calendar, Phone, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { weatherService, WeatherData } from "@/services/weatherService";
import { useToast } from "@/hooks/use-toast";
import { smsService } from "@/services/smsService";

interface WelcomeFarmerProps {
  farmerData: {
    name: string;
    phone: string;
    location: string;
  };
  onContinue: () => void;
}

const WelcomeFarmer = ({ farmerData, onContinue }: WelcomeFarmerProps) => {
  const { toast } = useToast();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [testPhone, setTestPhone] = useState(farmerData.phone);
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      const weatherData = await weatherService.getCurrentWeather(farmerData.location);
      setWeather(weatherData);
    } catch (error) {
      console.error('Weather loading error:', error);
    } finally {
      setLoadingWeather(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome to AquaWise!</h1>
                <p className="text-sm text-gray-600">Your Smart Irrigation Partner</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">New Member</Badge>
          </div>
        </div>
      </header>

      {/* Welcome Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome, {farmerData.name}! 🌱
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You've successfully joined our community of smart farmers. Let's get you started with 
            real-time weather updates and irrigation scheduling for your farm in {farmerData.location}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weather Widget */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sun className="h-5 w-5 mr-2 text-yellow-500" />
                Current Weather in {farmerData.location}
              </CardTitle>
              <CardDescription>Real-time conditions for your farm</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingWeather ? (
                <div className="text-center py-8">
                  <Sun className="h-12 w-12 text-yellow-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading weather data...</p>
                </div>
              ) : weather ? (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {weather.temperature}°C
                    </div>
                    <p className="text-gray-600 capitalize mb-4">{weather.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-blue-600 font-semibold">Humidity</p>
                      <p className="text-2xl font-bold text-blue-800">{weather.humidity}%</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-green-600 font-semibold">Rainfall</p>
                      <p className="text-2xl font-bold text-green-800">{weather.rainfall}mm</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">💡 Smart Recommendation</h4>
                    <p className="text-yellow-700 text-sm">
                      {weather.rainfall > 5 
                        ? "Recent rainfall detected. Consider reducing irrigation today."
                        : weather.humidity > 70
                        ? "High humidity levels. Monitor soil moisture before irrigating."
                        : "Good conditions for irrigation. Check your schedule!"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Weather data unavailable</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMS Setup */}
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
        </div>

        {/* Next Steps */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-500" />
              Next Steps: Start Your Smart Farming Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Add Your Crops</h4>
                <p className="text-sm text-gray-600">Tell us what you're growing so we can provide specific care recommendations.</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Create Schedule</h4>
                <p className="text-sm text-gray-600">Set up your first irrigation schedule based on weather and crop needs.</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Monitor & Optimize</h4>
                <p className="text-sm text-gray-600">Track water usage, get insights, and optimize your farming efficiency.</p>
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={onContinue}
                className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
              >
                Continue to Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default WelcomeFarmer;
