
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Droplets, MapPin, Calendar, 
  Download, RefreshCw, Filter, BarChart3
} from "lucide-react";
import { supabaseDataService } from "@/services/supabaseDataService";
import { useToast } from "@/hooks/use-toast";

const AdvancedAnalytics = () => {
  const { toast } = useToast();
  const [farms, setFarms] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(loadAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setRefreshing(true);
      const [farmsData, cropsData] = await Promise.all([
        supabaseDataService.getFarms(),
        supabaseDataService.getCrops()
      ]);
      
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (error) {
      console.error('Analytics loading error:', error);
      toast({
        title: "Error Loading Analytics",
        description: "Failed to load real-time data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Process real-time data for charts
  const locationData = farms.reduce((acc, farm) => {
    const location = farm.location;
    if (!acc[location]) {
      acc[location] = { location, farms: 0, totalSize: 0, crops: 0 };
    }
    acc[location].farms += 1;
    acc[location].totalSize += farm.size || 0;
    acc[location].crops += crops.filter(crop => crop.farm_id === farm.id).length;
    return acc;
  }, {} as any);

  const chartData = Object.values(locationData);

  const soilTypeData = farms.reduce((acc, farm) => {
    const soilType = farm.soil_type || 'Unknown';
    acc[soilType] = (acc[soilType] || 0) + 1;
    return acc;
  }, {} as any);

  const pieData = Object.entries(soilTypeData).map(([name, value]) => ({ name, value }));

  const cropDistribution = crops.reduce((acc, crop) => {
    acc[crop.name] = (acc[crop.name] || 0) + 1;
    return acc;
  }, {} as any);

  const cropData = Object.entries(cropDistribution).map(([name, value]) => ({ name, value }));

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const filteredData = selectedLocation === 'all' 
    ? chartData 
    : chartData.filter((item: any) => item.location === selectedLocation);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 animate-pulse text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading real-time analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Real-time Farm Analytics
              </CardTitle>
              <CardDescription>Live data from {farms.length} registered farms</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {Array.from(new Set(farms.map(f => f.location))).map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={loadAnalyticsData} 
                variant="outline"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="location">By Location</TabsTrigger>
              <TabsTrigger value="crops">Crop Analysis</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Total Farms</h3>
                  <p className="text-3xl font-bold text-green-900">{farms.length}</p>
                  <p className="text-sm text-green-600">Active across county</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Total Area</h3>
                  <p className="text-3xl font-bold text-blue-900">
                    {farms.reduce((sum, farm) => sum + (farm.size || 0), 0).toFixed(1)} acres
                  </p>
                  <p className="text-sm text-blue-600">Under irrigation</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Crop Varieties</h3>
                  <p className="text-3xl font-bold text-purple-900">{Object.keys(cropDistribution).length}</p>
                  <p className="text-sm text-purple-600">Different crops</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Soil Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Crop Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={cropData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle>Farms by Location</CardTitle>
                  <CardDescription>Distribution of farms across different locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="location" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="farms" fill="#10B981" name="Number of Farms" />
                      <Bar dataKey="totalSize" fill="#3B82F6" name="Total Size (acres)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crops">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Crop Analysis</CardTitle>
                    <CardDescription>Detailed breakdown of crop plantations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={cropData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(cropDistribution).map(([cropName, count], index) => (
                    <Card key={cropName}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{cropName}</h4>
                            <p className="text-sm text-gray-600">{count} plantations</p>
                          </div>
                          <Badge style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                            Active
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Trends</CardTitle>
                  <CardDescription>Farm registration and expansion patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Trend Analysis</h3>
                    <p className="text-gray-600">Historical trend data will appear here as more farms are registered over time.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
