
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Droplets, Thermometer } from "lucide-react";

interface WeatherWidgetProps {
  weather: any;
}

const WeatherWidget = ({ weather }: WeatherWidgetProps) => {
  if (!weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Loading weather data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Cloud className="h-5 w-5 mr-2" />
          Current Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className="text-3xl font-bold text-gray-900">
            {weather.temperature}°C
          </div>
          <p className="text-gray-600 capitalize">{weather.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Droplets className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-blue-600">Humidity</p>
              <p className="text-lg font-bold text-blue-900">{weather.humidity}%</p>
            </div>
            <div className="bg-cyan-50 p-3 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Thermometer className="h-4 w-4 text-cyan-600" />
              </div>
              <p className="text-xs text-cyan-600">Rainfall</p>
              <p className="text-lg font-bold text-cyan-900">{weather.rainfall}mm</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
