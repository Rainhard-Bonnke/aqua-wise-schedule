
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Droplets, ArrowLeft, Cloud, Key, CheckCircle, Calendar } from "lucide-react";
import { weatherService, WeatherData } from "@/services/weatherService";
import { useToast } from "@/hooks/use-toast";

interface WeatherSettingsProps {
  onBack: () => void;
}

const WeatherSettings = ({ onBack }: WeatherSettingsProps) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [testLocation, setTestLocation] = useState("Homa Bay, Kenya");
  const [testing, setTesting] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [hasValidKey, setHasValidKey] = useState(false);

  useEffect(() => {
    const existingKey = weatherService.getApiKey();
    if (existingKey) {
      setApiKey(existingKey);
      setHasValidKey(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter your OpenWeatherMap API key.",
        variant: "destructive"
      });
      return;
    }

    weatherService.setApiKey(apiKey);
    setHasValidKey(true);
    
    toast({
      title: "API Key Saved",
      description: "Your weather API key has been saved successfully.",
    });
  };

  const handleTestWeather = async () => {
    if (!hasValidKey) {
      toast({
        title: "Save API Key First",
        description: "Please save your API key before testing.",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    try {
      const data = await weatherService.getCurrentWeather(testLocation);
      setWeatherData(data);
      
      toast({
        title: "Weather Test Successful",
        description: `Successfully fetched weather data for ${testLocation}`,
      });
    } catch (error) {
      toast({
        title: "Weather Test Failed",
        description: "Could not fetch weather data. Please check your API key and location.",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Weather Settings</h1>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* API Key Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                OpenWeatherMap API Configuration
              </CardTitle>
              <CardDescription>
                Configure your weather data source for accurate irrigation recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Cloud className="h-4 w-4" />
                <AlertDescription>
                  To get real-time weather data, you need a free API key from OpenWeatherMap. 
                  Visit <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    openweathermap.org/api
                  </a> to get your free API key.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">OpenWeatherMap API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key here..."
                    className={hasValidKey ? "border-green-500" : ""}
                  />
                  {hasValidKey && (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      API key configured
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSaveApiKey}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save API Key
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Weather API */}
          <Card>
            <CardHeader>
              <CardTitle>Test Weather Integration</CardTitle>
              <CardDescription>
                Test your API key by fetching current weather data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testLocation">Test Location</Label>
                  <Input
                    id="testLocation"
                    value={testLocation}
                    onChange={(e) => setTestLocation(e.target.value)}
                    placeholder="e.g., Homa Bay, Kenya"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={handleTestWeather}
                    disabled={testing || !hasValidKey}
                    className="w-full"
                  >
                    {testing ? "Testing..." : "Test Weather API"}
                  </Button>
                </div>
              </div>

              {weatherData && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-4">Weather Test Results</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Current Conditions</h5>
                      <div className="space-y-2 text-sm">
                        <p><strong>Temperature:</strong> {weatherData.temperature}°C</p>
                        <p><strong>Humidity:</strong> {weatherData.humidity}%</p>
                        <p><strong>Rainfall:</strong> {weatherData.rainfall}mm</p>
                        <p><strong>Description:</strong> {weatherData.description}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">7-Day Forecast</h5>
                      <div className="space-y-1 text-sm">
                        {weatherData.forecast.slice(0, 3).map((day, index) => (
                          <p key={index}>
                            <strong>{new Date(day.date).toLocaleDateString()}:</strong> {day.temperature}°C, {day.description}
                          </p>
                        ))}
                        {weatherData.forecast.length > 3 && (
                          <p className="text-blue-600">+ {weatherData.forecast.length - 3} more days...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Integration Information */}
          <Card>
            <CardHeader>
              <CardTitle>How Weather Integration Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Cloud className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Real-time Weather Data</h4>
                    <p className="text-gray-600 text-sm">
                      Current temperature, humidity, rainfall, and wind conditions for precise irrigation timing.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">7-Day Forecast</h4>
                    <p className="text-gray-600 text-sm">
                      Advanced planning with weather predictions to optimize irrigation schedules.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Droplets className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Smart Adjustments</h4>
                    <p className="text-gray-600 text-sm">
                      Automatic irrigation schedule adjustments based on weather conditions and rainfall predictions.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default WeatherSettings;
