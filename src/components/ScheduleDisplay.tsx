
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Droplets, Download, Printer, Calendar, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScheduleDisplayProps {
  scheduleData: any;
  onBack: () => void;
}

const ScheduleDisplay = ({ scheduleData, onBack }: ScheduleDisplayProps) => {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your irrigation schedule is being prepared for download.",
    });
    console.log("Downloading schedule:", scheduleData);
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print Dialog Opened",
      description: "Your schedule is ready to print.",
    });
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'high':
        return '☀️';
      case 'medium':
        return '⛅';
      case 'low':
        return '🌧️';
      default:
        return '🌤️';
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
              <h1 className="text-2xl font-bold text-gray-900">AquaWise Scheduler</h1>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handlePrint} size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownload} size="sm" className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={onBack}>
                New Schedule
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Schedule Display */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Summary Card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-green-800 flex items-center justify-center">
                <Calendar className="h-8 w-8 mr-3" />
                Your Irrigation Schedule
              </CardTitle>
              <CardDescription>
                Personalized schedule for optimal water usage and crop health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="bg-green-100 p-3 rounded-lg mb-2">
                    <MapPin className="h-6 w-6 text-green-600 mx-auto" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Location</h4>
                  <p className="text-gray-600">{scheduleData.location}</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-lg mb-2">
                    <Droplets className="h-6 w-6 text-blue-600 mx-auto" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Crop & Soil</h4>
                  <p className="text-gray-600">{scheduleData.crop}</p>
                  <p className="text-gray-500 text-sm">{scheduleData.soilType}</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 p-3 rounded-lg mb-2">
                    <Clock className="h-6 w-6 text-purple-600 mx-auto" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Frequency</h4>
                  <p className="text-gray-600">Every {scheduleData.recommendation?.frequency}</p>
                  <p className="text-gray-500 text-sm">{scheduleData.recommendation?.duration}</p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Weather Conditions */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">Current Weather Conditions</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-2xl">{getWeatherIcon(scheduleData.weather?.temperature)}</span>
                    <p className="text-sm text-blue-700">Temperature: {scheduleData.weather?.temperature}</p>
                  </div>
                  <div>
                    <span className="text-2xl">{getWeatherIcon(scheduleData.weather?.rain)}</span>
                    <p className="text-sm text-blue-700">Rainfall: {scheduleData.weather?.rain}</p>
                  </div>
                  <div>
                    <span className="text-2xl">💧</span>
                    <p className="text-sm text-blue-700">Humidity: {scheduleData.weather?.humidity}</p>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">💡 Irrigation Recommendation</h4>
                <p className="text-green-700 mb-2">
                  <strong>Frequency:</strong> Irrigate every {scheduleData.recommendation?.frequency}
                </p>
                <p className="text-green-700 mb-2">
                  <strong>Duration:</strong> {scheduleData.recommendation?.duration} per session
                </p>
                <p className="text-green-700 mb-2">
                  <strong>Best Time:</strong> {scheduleData.recommendation?.bestTime}
                </p>
                <p className="text-green-600 text-sm italic">{scheduleData.recommendation?.notes}</p>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">Weekly Schedule</CardTitle>
              <CardDescription>Your irrigation schedule for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduleData.schedule?.map((day: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Droplets className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{day.day}</h4>
                        <p className="text-gray-600 text-sm">{day.time} - {day.duration}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {day.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">💡 Smart Irrigation Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Monitor soil moisture before each irrigation session
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Skip irrigation if rainfall is expected within 24 hours
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Adjust duration based on soil moisture levels
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Water early morning or evening to reduce evaporation
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ScheduleDisplay;
