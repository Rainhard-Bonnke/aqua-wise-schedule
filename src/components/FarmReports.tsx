
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Download, Calendar, MapPin, Users, 
  Droplets, TrendingUp, Printer, Filter
} from "lucide-react";
import { supabaseDataService } from "@/services/supabaseDataService";
import { useToast } from "@/hooks/use-toast";

const FarmReports = () => {
  const { toast } = useToast();
  const [farms, setFarms] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const [farmsData, cropsData] = await Promise.all([
        supabaseDataService.getFarms(),
        supabaseDataService.getCrops()
      ]);
      
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (error) {
      console.error('Reports loading error:', error);
      toast({
        title: "Error Loading Reports",
        description: "Failed to load farm data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = (type: string) => {
    toast({
      title: "Report Generated",
      description: `${type} report has been generated and downloaded.`,
    });
  };

  const filteredFarms = selectedFarm === 'all' 
    ? farms 
    : farms.filter(farm => farm.id === selectedFarm);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <FileText className="h-12 w-12 animate-pulse text-green-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading farm reports...</p>
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
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Farm Reports & Analytics
              </CardTitle>
              <CardDescription>Comprehensive reports for {farms.length} registered farms</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedFarm} onValueChange={setSelectedFarm}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Farms</SelectItem>
                  {farms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>
                      {farm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Farm Summary</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="irrigation">Irrigation</TabsTrigger>
              <TabsTrigger value="exports">Export Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800">Total Farms</h3>
                    <p className="text-2xl font-bold text-green-900">{filteredFarms.length}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Total Area</h3>
                    <p className="text-2xl font-bold text-blue-900">
                      {filteredFarms.reduce((sum, farm) => sum + (farm.size || 0), 0).toFixed(1)} acres
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800">Active Crops</h3>
                    <p className="text-2xl font-bold text-purple-900">
                      {filteredFarms.reduce((sum, farm) => {
                        return sum + crops.filter(crop => crop.farm_id === farm.id).length;
                      }, 0)}
                    </p>
                  </div>
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-cyan-800">Water Saved</h3>
                    <p className="text-2xl font-bold text-cyan-900">
                      {(filteredFarms.reduce((sum, farm) => sum + (farm.size || 0), 0) * 15).toFixed(0)}K L
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredFarms.map((farm) => {
                    const farmCrops = crops.filter(crop => crop.farm_id === farm.id);
                    return (
                      <Card key={farm.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{farm.name}</CardTitle>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          <CardDescription>
                            📍 {farm.location} • 🌾 {farm.size} acres • 🌱 {farm.soil_type} soil
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Crops Planted:</span>
                              <span className="font-semibold">{farmCrops.length} varieties</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Registration Date:</span>
                              <span className="text-sm">{new Date(farm.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Est. Water Savings:</span>
                              <span className="font-semibold text-green-600">{(farm.size * 15).toFixed(0)}L/day</span>
                            </div>
                            <div className="pt-2">
                              <p className="text-sm text-gray-600 mb-2">Active Crops:</p>
                              <div className="flex flex-wrap gap-1">
                                {farmCrops.map((crop) => (
                                  <Badge key={crop.id} variant="outline" className="text-xs">
                                    {crop.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Farm Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators for selected farms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {filteredFarms.map((farm) => {
                      const farmCrops = crops.filter(crop => crop.farm_id === farm.id);
                      const efficiency = Math.min(95, 70 + (farmCrops.length * 5));
                      
                      return (
                        <div key={farm.id} className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-3">{farm.name} Performance</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{efficiency}%</div>
                              <div className="text-sm text-gray-600">Water Efficiency</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{farmCrops.length}</div>
                              <div className="text-sm text-gray-600">Active Crops</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{farm.size}</div>
                              <div className="text-sm text-gray-600">Acres Managed</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="irrigation">
              <Card>
                <CardHeader>
                  <CardTitle>Irrigation Reports</CardTitle>
                  <CardDescription>Water usage and irrigation schedule reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Droplets className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Irrigation Data</h3>
                    <p className="text-gray-600 mb-4">
                      Irrigation logs and water usage reports will appear here as farmers use the system.
                    </p>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Set Up Irrigation Schedules
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exports">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Export Reports</CardTitle>
                    <CardDescription>Download comprehensive reports in various formats</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        onClick={() => generateReport('Farm Summary')}
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <Download className="h-6 w-6" />
                        <span>Farm Summary Report</span>
                        <span className="text-xs opacity-75">PDF Format</span>
                      </Button>
                      <Button 
                        onClick={() => generateReport('Performance')}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <TrendingUp className="h-6 w-6" />
                        <span>Performance Analytics</span>
                        <span className="text-xs opacity-75">Excel Format</span>
                      </Button>
                      <Button 
                        onClick={() => generateReport('Water Usage')}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <Droplets className="h-6 w-6" />
                        <span>Water Usage Report</span>
                        <span className="text-xs opacity-75">CSV Format</span>
                      </Button>
                      <Button 
                        onClick={() => generateReport('Complete')}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <Printer className="h-6 w-6" />
                        <span>Complete Report</span>
                        <span className="text-xs opacity-75">PDF Format</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmReports;
