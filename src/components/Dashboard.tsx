
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, TrendingUp, Calendar, Users, Plus, 
  Bell, Activity, Calculator, MessageCircle
} from "lucide-react";
import { dataService, Farm, IrrigationSchedule } from "@/services/dataService";
import { weatherService } from "@/services/weatherService";
import { useToast } from "@/hooks/use-toast";
import StatsCard from "./dashboard/StatsCard";
import WeatherWidget from "./dashboard/WeatherWidget";
import FarmsList from "./dashboard/FarmsList";
import QuickActions from "./dashboard/QuickActions";

interface DashboardProps {
  onNavigate: (view: string, data?: any) => void;
  unreadNotifications?: number;
}

const Dashboard = ({ onNavigate, unreadNotifications = 0 }: DashboardProps) => {
  const { toast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const farmsData = dataService.getFarms();
      const schedulesData = dataService.getSchedules();
      
      setFarms(farmsData);
      setSchedules(schedulesData);
      
      if (farmsData.length > 0) {
        const weatherData = await weatherService.getCurrentWeather(farmsData[0].location);
        setWeather(weatherData);
      }
      
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

  const statsData = [
    {
      title: "Registered Farmers",
      value: "836",
      icon: Users,
      trend: "+12%",
      color: "text-blue-600"
    },
    {
      title: "Managed Farms",
      value: farms.length.toString(),
      icon: Activity,
      trend: "+5%",
      color: "text-green-600"
    },
    {
      title: "Water Saved",
      value: "245K L",
      icon: Droplets,
      trend: "+18%",
      color: "text-cyan-600"
    },
    {
      title: "System Efficiency",
      value: "88.3%",
      icon: TrendingUp,
      trend: "+2.1%",
      color: "text-purple-600"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Droplets className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Dashboard</h1>
          <p className="text-gray-600">Extension Officer and Administrator Control Center</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button 
            onClick={() => onNavigate("farmers")}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Farmer
          </Button>
          <Button 
            onClick={() => onNavigate("schedules")}
            variant="outline"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Manage Schedules
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Farms */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Farmer Management
              </CardTitle>
              <CardDescription>
                Manage farmers and their irrigation systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Farmer Registration System</h3>
                <p className="text-gray-600 mb-4">
                  Register new farmers and manage their farm profiles through the extension officer interface.
                </p>
                <Button onClick={() => onNavigate("farmers")} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Register New Farmer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <WeatherWidget weather={weather} />
          <QuickActions onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
