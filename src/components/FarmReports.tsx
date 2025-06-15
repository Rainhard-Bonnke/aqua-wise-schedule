
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, Download, Calendar, 
  Droplets, TrendingUp, Printer, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { subDays } from "date-fns";

const FarmReports = () => {
  const { toast } = useToast();
  const [farms, setFarms] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [irrigationLogs, setIrrigationLogs] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);

  const getDateRange = (rangeKey: string) => {
    const now = new Date();
    let from: Date | undefined;
    const to = new Date();
    switch(rangeKey) {
        case 'week':
            from = subDays(now, 7);
            break;
        case 'month':
            from = subDays(now, 30);
            break;
        case 'quarter':
            from = subDays(now, 90);
            break;
        case 'year':
            from = subDays(now, 365);
            break;
        default:
            from = undefined;
    }
    return { from, to };
  }

  useEffect(() => {
    loadReportData();
  }, [selectedFarm, dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const farmsPromise = supabase.from('farms').select('*');
      const cropsPromise = supabase.from('crops').select('*');

      const { from, to } = getDateRange(dateRange);

      let logsQuery = supabase.from('irrigation_logs').select('*, farms(name), irrigation_schedules(crops(name))').order('irrigation_date', { ascending: false });

      if (selectedFarm !== 'all') {
        logsQuery = logsQuery.eq('farm_id', selectedFarm);
      }
      if (from) {
        logsQuery = logsQuery.gte('irrigation_date', from.toISOString());
      }
      if (to) {
        logsQuery = logsQuery.lte('irrigation_date', to.toISOString());
      }

      const [
          { data: farmsData, error: farmsError },
          { data: cropsData, error: cropsError },
          { data: logsData, error: logsError }
      ] = await Promise.all([farmsPromise, cropsPromise, logsQuery]);

      if (farmsError) throw farmsError;
      if (cropsError) throw cropsError;
      if (logsError) throw logsError;
      
      setFarms(farmsData || []);
      setCrops(cropsData || []);
      setIrrigationLogs(logsData || []);
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

  const downloadCSV = (headers: string[], data: any[][], filename: string) => {
    const csvContent = [
        headers.join(','),
        ...data.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const generateReport = (type: string, format: 'pdf' | 'csv' | 'excel' = 'pdf') => {
    const doc = new jsPDF();

    if (format === 'csv' || format === 'excel') {
        let headers: string[] = [];
        let data: any[][] = [];
        const filename = `aquawise-${type.toLowerCase().replace(/ /g, '-')}-report.csv`;

        if (type === 'Farm Summary' || type === 'Complete') {
            headers = ['Farm Name', 'Location', 'Size (acres)', 'Soil Type', 'Crops'];
            data = filteredFarms.map(farm => {
                const farmCrops = crops.filter(c => c.farm_id === farm.id);
                return [
                    farm.name, farm.location, farm.size, farm.soil_type,
                    farmCrops.map(c => c.name).join(', ')
                ];
            });
        }
        if (type === 'Performance' || type === 'Complete') {
            if (data.length > 0) data.push(['']); // separator
            headers = ['Farm Name', 'Water Efficiency', 'Active Crops', 'Acres Managed'];
            data.push(...filteredFarms.map(farm => {
                const farmCrops = crops.filter(c => c.farm_id === farm.id);
                const efficiency = Math.min(95, 70 + (farmCrops.length * 5));
                return [farm.name, `${efficiency}%`, farmCrops.length, farm.size];
            }));
        }
        if (type === 'Water Usage' || type === 'Complete') {
            if (data.length > 0) data.push(['']); // separator
            headers = ['Farm', 'Crop', 'Date', 'Duration (min)', 'Water Used (L)'];
            data.push(...irrigationLogs.map(log => [
                log.farms?.name || 'N/A',
                log.irrigation_schedules?.crops?.name || 'N/A',
                new Date(log.irrigation_date).toLocaleString(),
                log.duration,
                log.water_used
            ]));
        }
        
        if (data.length > 0) {
            downloadCSV(type === 'Complete' ? ['AquaWise Complete Report'] : headers, data, filename);
        }

        toast({ title: "Report Downloaded", description: `Your ${type} report has been generated.` });
        return;
    }
    
    // PDF Generation
    const today = new Date().toLocaleDateString();
    const title = `AquaWise Report: ${type}`;

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${today}`, 14, 30);
    
    const farmName = selectedFarm === 'all'
      ? 'All Farms'
      : farms.find(f => f.id === selectedFarm)?.name || 'Selected Farm';
    doc.text(`For: ${farmName}`, 14, 36);

    let finalY = 40;

    const addPageIfNeeded = () => {
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }
    };
    
    if (type === 'Farm Summary' || type === 'Complete') {
      addPageIfNeeded();
      doc.setFontSize(14);
      doc.text('Farm Summary', 14, finalY + 10);
      const summaryBody = filteredFarms.map(farm => {
        const farmCrops = crops.filter(c => c.farm_id === farm.id);
        return [
          farm.name,
          farm.location,
          farm.size,
          farm.soil_type,
          farmCrops.length > 0 ? farmCrops.map(c => c.name).join(', ') : 'None'
        ];
      });
      autoTable(doc, {
        startY: finalY + 15,
        head: [['Farm Name', 'Location', 'Size (acres)', 'Soil Type', 'Crops']],
        body: summaryBody,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] },
      });
      finalY = (doc as any).lastAutoTable.finalY;
    }

    if (type === 'Performance' || type === 'Complete') {
      addPageIfNeeded();
      doc.setFontSize(14);
      doc.text('Performance Metrics', 14, finalY + 15);
      const performanceBody = filteredFarms.map(farm => {
        const farmCrops = crops.filter(c => c.farm_id === farm.id);
        const efficiency = Math.min(95, 70 + (farmCrops.length * 5));
        return [farm.name, `${efficiency}%`, farmCrops.length, farm.size];
      });
      autoTable(doc, {
        startY: finalY + 20,
        head: [['Farm Name', 'Water Efficiency', 'Active Crops', 'Acres Managed']],
        body: performanceBody,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74] },
      });
      finalY = (doc as any).lastAutoTable.finalY;
    }
    
    if (type === 'Water Usage' || type === 'Complete') {
        addPageIfNeeded();
        doc.setFontSize(14);
        doc.text('Irrigation & Water Usage', 14, finalY + 15);
        if(irrigationLogs.length > 0) {
          const waterUsageBody = irrigationLogs.map(log => [
              log.farms?.name || 'N/A',
              log.irrigation_schedules?.crops?.name || 'N/A',
              new Date(log.irrigation_date).toLocaleDateString(),
              `${log.duration} min`,
              `${log.water_used} L`
          ]);
          autoTable(doc, {
              startY: finalY + 20,
              head: [['Farm', 'Crop', 'Date', 'Duration', 'Water Used (L)']],
              body: waterUsageBody,
              theme: 'striped',
              headStyles: { fillColor: [22, 163, 74] },
          });
        } else {
          autoTable(doc, {
            startY: finalY + 20,
            body: [['No irrigation data available for the selected period.']],
          });
        }
        finalY = (doc as any).lastAutoTable.finalY;
    }

    doc.save(`aquawise-${type.toLowerCase().replace(/ /g, '-')}-report.pdf`);

    toast({
      title: "Report Generated",
      description: `Your ${type} report has been successfully downloaded.`,
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
                  <CardTitle>Irrigation Logs</CardTitle>
                  <CardDescription>Water usage and irrigation activities for the selected period.</CardDescription>
                </CardHeader>
                <CardContent>
                  {irrigationLogs.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Farm</TableHead>
                          <TableHead>Crop</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Water Used</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {irrigationLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.farms?.name || 'N/A'}</TableCell>
                            <TableCell>{log.irrigation_schedules?.crops?.name || 'N/A'}</TableCell>
                            <TableCell>{new Date(log.irrigation_date).toLocaleString()}</TableCell>
                            <TableCell>{log.duration} mins</TableCell>
                            <TableCell>{log.water_used} L</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Droplets className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Irrigation Data</h3>
                      <p className="text-gray-600">
                        No irrigation logs found for the selected farm and date range.
                      </p>
                    </div>
                  )}
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
                        onClick={() => generateReport('Farm Summary', 'pdf')}
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <Download className="h-6 w-6" />
                        <span>Farm Summary Report</span>
                        <span className="text-xs opacity-75">PDF Format</span>
                      </Button>
                      <Button 
                        onClick={() => generateReport('Performance', 'excel')}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <TrendingUp className="h-6 w-6" />
                        <span>Performance Analytics</span>
                        <span className="text-xs opacity-75">CSV (for Excel)</span>
                      </Button>
                      <Button 
                        onClick={() => generateReport('Water Usage', 'csv')}
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center space-y-2"
                      >
                        <Droplets className="h-6 w-6" />
                        <span>Water Usage Report</span>
                        <span className="text-xs opacity-75">CSV Format</span>
                      </Button>
                      <Button 
                        onClick={() => generateReport('Complete', 'pdf')}
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
