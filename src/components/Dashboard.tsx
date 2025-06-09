import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Droplets, TrendingUp, Calendar, MapPin, Settings, Plus, BarChart3, 
  Bell, Users, FileText, Calculator, MessageCircle, UserCheck, Activity, Database 
} from "lucide-react";
import { dataService, Farm, IrrigationSchedule } from "@/services/dataService";
import { weatherService } from "@/services/weatherService";
import { notificationService } from "@/services/notificationService";
import { useToast } from "@/hooks/use-toast";
import Header from "./Header";
import StatsOverview from "./StatsOverview";
import AdvancedAnalytics from "./AdvancedAnalytics";
import CostCalculator from "./CostCalculator";
import CommunitySharing from "./CommunitySharing";
import ExtensionOfficerDashboard from "./ExtensionOfficerDashboard";
import SoilMoistureTracker from "./SoilMoistureTracker";

interface DashboardProps {
  onNavigate: (view: string, data?: any) => void;
  unreadNotifications?: number;
  onShowNotifications?: () => void;
}

const Dashboard = ({ onNavigate, unreadNotifications = 0, onShowNotifications }: DashboardProps) => {
  const { toast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
      .slice(0, 5);
    
    return upcoming;
  };

  const statsData = {
    totalFarmers: 836,
    activeFarms: farms.length,
    totalWaterUsed: analytics?.totalWaterUsed || 245000,
    efficiency: analytics?.efficiency || 88.3,
    activeSchedules: schedules.filter(s => s.isActive).length,
    pendingApprovals: 12,
    completedIrrigations: 34,
    upcomingIrrigations: getUpcomingIrrigations().length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <Droplets className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading county dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-25 to-blue-50">
      <Header 
        onNavigate={onNavigate} 
        unreadNotifications={unreadNotifications}
        onShowNotifications={onShowNotifications}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="extension">Extension</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <StatsOverview data={statsData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Farms Overview */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center text-xl">
                          <MapPin className="h-5 w-5 mr-2 text-green-600" />
                          Registered Farms
                        </CardTitle>
                        <CardDescription>
                          Active farms across Homa Bay County
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={() => onNavigate("add-farm")}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Register Farm
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {farms.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No farms registered yet</h3>
                        <p className="text-gray-600 mb-6">Start by registering the first farm in the system</p>
                        <Button 
                          onClick={() => onNavigate("add-farm")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Register First Farm
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {farms.slice(0, 6).map((farm) => (
                          <div 
                            key={farm.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-white"
                            onClick={() => onNavigate("farm-detail", farm)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div className="bg-green-100 p-2 rounded-lg">
                                    <MapPin className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{farm.name}</h4>
                                    <p className="text-sm text-gray-600">
                                      {farm.location} • {farm.size} acres • {farm.soilType}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {farm.crops.length} crops planted
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Active
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  ID: {farm.id.slice(-6)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {farms.length > 6 && (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => onNavigate("farms")}
                          >
                            View All {farms.length} Farms
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Weather Widget */}
                {weather && (
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg">Current Weather</CardTitle>
                      <CardDescription>
                        Homa Bay County
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {weather.temperature}°C
                        </div>
                        <p className="text-gray-600 capitalize mb-4">{weather.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-blue-600 font-medium">Humidity</p>
                            <p className="text-xl font-bold text-blue-900">{weather.humidity}%</p>
                          </div>
                          <div className="bg-cyan-50 p-3 rounded-lg">
                            <p className="text-cyan-600 font-medium">Rainfall</p>
                            <p className="text-xl font-bold text-cyan-900">{weather.rainfall}mm</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Upcoming Irrigations */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Upcoming Irrigations
                    </CardTitle>
                    <CardDescription>Next scheduled waterings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getUpcomingIrrigations().length === 0 ? (
                      <div className="text-center py-6">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">No upcoming irrigations</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getUpcomingIrrigations().map((irrigation, index) => (
                          <div key={irrigation.id} className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-3 rounded-r-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {new Date(irrigation.nextIrrigation).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {irrigation.duration} min • {irrigation.bestTime}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {index === 0 ? "Next" : `+${index}`}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-green-50 hover:border-green-200"
                      onClick={() => onNavigate("create-schedule")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Create Schedule
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-blue-50 hover:border-blue-200"
                      onClick={() => setActiveTab("monitoring")}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Soil Monitoring
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-purple-50 hover:border-purple-200"
                      onClick={() => setActiveTab("costs")}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Cost Calculator
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-orange-50 hover:border-orange-200"
                      onClick={() => setActiveTab("community")}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Community
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-indigo-50 hover:border-indigo-200"
                      onClick={() => onNavigate("data-management")}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Data Management
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start hover:bg-gray-50 hover:border-gray-200"
                      onClick={() => onNavigate("weather-settings")}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AdvancedAnalytics />
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <SoilMoistureTracker farmId={farms[0]?.id || 'demo-farm'} />
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs">
            <CostCalculator farmId={farms[0]?.id || 'demo-farm'} />
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <CommunitySharing />
          </TabsContent>

          {/* Extension Tab */}
          <TabsContent value="extension">
            <ExtensionOfficerDashboard />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reporting Center</h3>
              <p className="text-gray-600 mb-6">Advanced reporting features</p>
              <Button 
                onClick={() => onNavigate("data-management")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Database className="h-4 w-4 mr-2" />
                Access Data Management
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
