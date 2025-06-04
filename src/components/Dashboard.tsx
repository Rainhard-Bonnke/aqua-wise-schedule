
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, TrendingUp, Calendar, MapPin, Settings, Plus, BarChart3, Bell } from "lucide-react";
import { dataService, Farm, IrrigationSchedule } from "@/services/dataService";
import { weatherService } from "@/services/weatherService";
import { notificationService } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  onNavigate: (view: string, data?: any) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { toast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    notificationService.requestNotificationPermission();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load farms and schedules
      const farmsData = dataService.getFarms();
      const schedulesData = dataService.getSchedules();
      
      setFarms(farmsData);
      setSchedules(schedulesData);
      
      // Load weather for first farm
      if (farmsData.length > 0) {
        const weatherData = await weatherService.getCurrentWeather(farmsData[0].location);
        setWeather(weatherData);
      }
      
      // Load analytics
      const analyticsData = dataService.getWaterUsageAnalytics();
      setAnalytics(analyticsData);
      
    } catch (error) {
      console.error('Dashboard loading error:', error);
      toast({
        title: "Error Loading Dashboard",
        description: "Some data could not be loaded. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingIrrigations = () => {
    const now = new Date();
    const upcoming = schedules
      .filter(s => s.isActive)
      .map(s => ({
        ...s,
        nextDate: new Date(s.nextIrrigation)
      }))
      .filter(s => s.nextDate > now)
      .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
      .slice(0, 3);
    
    return upcoming;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <Droplets className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AquaWise Dashboard</h1>
                <p className="text-sm text-gray-600">Smart Irrigation Management</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => onNavigate("notifications")}
                size="sm"
              >
                <Bell className="h-4 w-4 mr-2" />
                Alerts
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onNavigate("analytics")}
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button 
                onClick={() => onNavigate("add-farm")}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Farm
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Farms</p>
                  <p className="text-2xl font-bold text-gray-900">{farms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Schedules</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {schedules.filter(s => s.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Droplets className="h-8 w-8 text-cyan-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Water Used (30d)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.totalWaterUsed?.toFixed(0) || 0}L
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.efficiency?.toFixed(1) || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Farms Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Your Farms
                </CardTitle>
                <CardDescription>
                  Manage your farms and irrigation schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                {farms.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No farms registered yet</p>
                    <Button 
                      onClick={() => onNavigate("add-farm")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Add Your First Farm
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {farms.map((farm) => (
                      <div 
                        key={farm.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => onNavigate("farm-detail", farm)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{farm.name}</h4>
                            <p className="text-sm text-gray-600">
                              {farm.location} • {farm.size} acres • {farm.soilType}
                            </p>
                            <p className="text-sm text-gray-500">
                              {farm.crops.length} crops planted
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Widget */}
            {weather && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Weather</CardTitle>
                  <CardDescription>
                    {farms.length > 0 ? farms[0].location : 'Your area'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {weather.temperature}°C
                    </div>
                    <p className="text-gray-600 capitalize mb-4">{weather.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Humidity</p>
                        <p className="font-semibold">{weather.humidity}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Rainfall</p>
                        <p className="font-semibold">{weather.rainfall}mm</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Irrigations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Irrigations</CardTitle>
                <CardDescription>Next scheduled waterings</CardDescription>
              </CardHeader>
              <CardContent>
                {getUpcomingIrrigations().length === 0 ? (
                  <p className="text-gray-600 text-center py-4">
                    No upcoming irrigations scheduled
                  </p>
                ) : (
                  <div className="space-y-3">
                    {getUpcomingIrrigations().map((irrigation, index) => (
                      <div key={irrigation.id} className="border-l-4 border-green-500 pl-4">
                        <p className="font-medium text-gray-900">
                          {new Date(irrigation.nextIrrigation).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {irrigation.duration} minutes • {irrigation.bestTime}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onNavigate("create-schedule")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Schedule
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onNavigate("weather-settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Weather Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => onNavigate("export-data")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
