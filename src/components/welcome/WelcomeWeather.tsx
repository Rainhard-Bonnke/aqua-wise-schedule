
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherData } from "@/services/weatherService";
import { Sun } from "lucide-react";

interface WelcomeWeatherProps {
  location: string;
  weather: WeatherData | null;
  loadingWeather: boolean;
}

const WelcomeWeather = ({ location, weather, loadingWeather }: WelcomeWeatherProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sun className="h-5 w-5 mr-2 text-yellow-500" />
          Current Weather in {location}
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
  );
};

export default WelcomeWeather;
