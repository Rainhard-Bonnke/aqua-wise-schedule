
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Droplets } from "lucide-react";
import { weatherService, WeatherData } from "@/services/weatherService";
import WelcomeWeather from "./welcome/WelcomeWeather";
import SmsSetup from "./welcome/SmsSetup";
import NextSteps from "./welcome/NextSteps";

interface WelcomeFarmerProps {
  farmerData: {
    name: string;
    phone: string;
    location: string;
  };
  onContinue: () => void;
}

const WelcomeFarmer = ({ farmerData, onContinue }: WelcomeFarmerProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    loadWeatherData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <WelcomeWeather 
            location={farmerData.location}
            weather={weather}
            loadingWeather={loadingWeather}
          />
          <SmsSetup initialPhone={farmerData.phone} />
        </div>
        
        <NextSteps onContinue={onContinue} />
      </main>
    </div>
  );
};

export default WelcomeFarmer;
