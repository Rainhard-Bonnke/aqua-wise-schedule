
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScheduleFormProps {
  onScheduleGenerated: (data: any) => void;
  onBack: () => void;
}

const ScheduleForm = ({ onScheduleGenerated, onBack }: ScheduleFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    crop: "",
    soilType: "",
    location: "",
    farmSize: ""
  });

  const crops = [
    { value: "maize", label: "Maize", waterNeed: "Medium", frequency: "3 days" },
    { value: "beans", label: "Beans", waterNeed: "Low", frequency: "4 days" },
    { value: "tomatoes", label: "Tomatoes", waterNeed: "High", frequency: "2 days" },
    { value: "potatoes", label: "Potatoes", waterNeed: "Medium", frequency: "3 days" },
    { value: "cabbage", label: "Cabbage", waterNeed: "High", frequency: "2 days" },
    { value: "sukuma-wiki", label: "Sukuma Wiki", waterNeed: "Medium", frequency: "3 days" }
  ];

  const soilTypes = [
    { value: "sandy", label: "Sandy Soil", retention: "Low", drainRate: "Fast" },
    { value: "clay", label: "Clay Soil", retention: "High", drainRate: "Slow" },
    { value: "loamy", label: "Loamy Soil", retention: "Medium", drainRate: "Moderate" }
  ];

  const locations = [
    "Rachuonyo North", "Rachuonyo South", "Rachuonyo East",
    "Homa Bay Town", "Ndhiwa", "Rangwe", "Suba North", "Suba South"
  ];

  const generateSchedule = () => {
    const selectedCrop = crops.find(crop => crop.value === formData.crop);
    const selectedSoil = soilTypes.find(soil => soil.value === formData.soilType);
    
    // Mock weather data (in real app, this would come from API)
    const weatherForecast = {
      rain: "Low",
      temperature: "High",
      humidity: "Medium"
    };

    // Generate irrigation recommendation
    let frequency = "3 days";
    let duration = "30 minutes";
    
    if (selectedCrop?.waterNeed === "High") {
      frequency = "2 days";
      duration = "40 minutes";
    } else if (selectedCrop?.waterNeed === "Low") {
      frequency = "4 days";
      duration = "25 minutes";
    }

    // Adjust for soil type
    if (selectedSoil?.retention === "Low") {
      duration = (parseInt(duration) + 10) + " minutes";
    } else if (selectedSoil?.retention === "High") {
      duration = (parseInt(duration) - 5) + " minutes";
    }

    const scheduleData = {
      ...formData,
      crop: selectedCrop?.label,
      soilType: selectedSoil?.label,
      weather: weatherForecast,
      recommendation: {
        frequency,
        duration,
        bestTime: "Early morning (6-8 AM) or evening (5-7 PM)",
        notes: `Based on ${selectedCrop?.label} water requirements and ${selectedSoil?.label} characteristics.`
      },
      schedule: generateWeeklySchedule(frequency)
    };

    console.log("Generated schedule:", scheduleData);
    onScheduleGenerated(scheduleData);
  };

  const generateWeeklySchedule = (frequency: string) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const freqNum = parseInt(frequency);
    const schedule = [];
    
    for (let i = 0; i < 7; i += freqNum) {
      if (i < 7) {
        schedule.push({
          day: days[i],
          time: "6:00 AM",
          duration: formData.crop === "tomatoes" || formData.crop === "cabbage" ? "40 minutes" : "30 minutes",
          status: "scheduled"
        });
      }
    }
    
    return schedule;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.crop || !formData.soilType || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    generateSchedule();
    toast({
      title: "Schedule Generated!",
      description: "Your irrigation schedule has been created based on current conditions.",
    });
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
            <Button variant="outline" onClick={onBack}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Schedule Form */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-3xl text-green-800">Create Irrigation Schedule</CardTitle>
              <CardDescription className="text-gray-600">
                Tell us about your crop, soil, and location to get a personalized irrigation schedule.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="crop">Crop Type *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({...prev, crop: value}))} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your crop" />
                      </SelectTrigger>
                      <SelectContent>
                        {crops.map((crop) => (
                          <SelectItem key={crop.value} value={crop.value}>
                            <div className="flex justify-between items-center w-full">
                              <span>{crop.label}</span>
                              <span className="text-sm text-gray-500 ml-2">({crop.waterNeed} water need)</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soilType">Soil Type *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({...prev, soilType: value}))} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                      <SelectContent>
                        {soilTypes.map((soil) => (
                          <SelectItem key={soil.value} value={soil.value}>
                            <div className="flex justify-between items-center w-full">
                              <span>{soil.label}</span>
                              <span className="text-sm text-gray-500 ml-2">({soil.retention} retention)</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({...prev, location: value}))} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size (Acres)</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({...prev, farmSize: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select farm size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5 acres</SelectItem>
                        <SelectItem value="1">1 acre</SelectItem>
                        <SelectItem value="2">2 acres</SelectItem>
                        <SelectItem value="5">5 acres</SelectItem>
                        <SelectItem value="10">10+ acres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Weather Integration</h4>
                  <p className="text-blue-700 text-sm">
                    Our system will automatically fetch the latest 7-day weather forecast for your location 
                    to optimize your irrigation schedule and avoid watering before expected rainfall.
                  </p>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                  Generate My Irrigation Schedule
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ScheduleForm;
