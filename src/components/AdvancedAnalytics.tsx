
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Filter, BarChart3 } from "lucide-react";
import { supabaseDataService } from "@/services/supabaseDataService";
import { useToast } from "@/hooks/use-toast";
import OverviewTab from "./analytics/OverviewTab";
import LocationTab from "./analytics/LocationTab";
import CropsTab from "./analytics/CropsTab";
import TrendsTab from "./analytics/TrendsTab";

interface LocationStats {
  location: string;
  farms: number;
  totalSize: number;
  crops: number;
}

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
      if(!loading) setRefreshing(true);
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
  }, {} as { [key: string]: LocationStats });

  const chartData: LocationStats[] = Object.values(locationData);

  const soilTypeData: { [key: string]: number } = farms.reduce((acc: {[key: string]: number}, farm) => {
    const soilType = farm.soil_type || 'Unknown';
    acc[soilType] = (acc[soilType] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(soilTypeData).map(([name, value]) => ({ name, value }));

  const cropDistribution: { [key: string]: number } = crops.reduce((acc: { [key: string]: number }, crop) => {
    acc[crop.name] = (acc[crop.name] || 0) + 1;
    return acc;
  }, {});

  const cropData = Object.entries(cropDistribution).map(([name, value]) => ({ name, value }));

  const filteredData = selectedLocation === 'all' 
    ? chartData 
    : chartData.filter((item) => item.location === selectedLocation);

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
                  <SelectValue placeholder="Filter by location" />
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
                onClick={() => loadAnalyticsData()} 
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
              <OverviewTab farms={farms} cropDistribution={cropDistribution} pieData={pieData} cropData={cropData} />
            </TabsContent>

            <TabsContent value="location">
              <LocationTab filteredData={filteredData} />
            </TabsContent>

            <TabsContent value="crops">
              <CropsTab cropData={cropData} cropDistribution={cropDistribution} />
            </TabsContent>

            <TabsContent value="trends">
              <TrendsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
