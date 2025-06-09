
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, Upload, FileText, Database, Calendar, 
  CheckCircle, AlertCircle, ArrowLeft
} from "lucide-react";
import { dataService } from "@/services/dataService";
import { format } from "date-fns";

interface DataExportImportProps {
  onBack: () => void;
}

const DataExportImport = ({ onBack }: DataExportImportProps) => {
  const { toast } = useToast();
  const [importData, setImportData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Get all data
      const exportData = dataService.exportData();
      
      // Create downloadable file
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aquawise-data-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Your data has been exported successfully.",
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: "No Data",
        description: "Please paste the data to import.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsImporting(true);
      
      // Validate JSON
      JSON.parse(importData);
      
      // Import data
      const success = dataService.importData(importData);
      
      if (success) {
        toast({
          title: "Import Successful",
          description: "Data has been imported successfully.",
        });
        setImportData("");
      } else {
        throw new Error("Import failed");
      }

    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: "Invalid data format or import error. Please check your data.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const generateReport = () => {
    const farms = dataService.getFarms();
    const schedules = dataService.getSchedules();
    const logs = dataService.getIrrigationLogs();
    const analytics = dataService.getWaterUsageAnalytics();

    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalFarms: farms.length,
        activeSchedules: schedules.filter(s => s.isActive).length,
        totalIrrigations: logs.length,
        totalWaterUsed: analytics.totalWaterUsed,
        averageDailyUsage: analytics.averageDaily,
        efficiency: analytics.efficiency
      },
      farms: farms.map(farm => ({
        id: farm.id,
        name: farm.name,
        location: farm.location,
        size: farm.size,
        soilType: farm.soilType,
        cropsCount: farm.crops.length,
        farmerName: farm.farmerName,
        createdAt: farm.createdAt
      })),
      irrigationSummary: logs.reduce((acc, log) => {
        if (!acc[log.farmId]) {
          acc[log.farmId] = {
            totalIrrigations: 0,
            totalWaterUsed: 0,
            completedIrrigations: 0
          };
        }
        acc[log.farmId].totalIrrigations++;
        acc[log.farmId].totalWaterUsed += log.waterUsed;
        if (log.completed) acc[log.farmId].completedIrrigations++;
        return acc;
      }, {} as any)
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aquawise-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Generated",
      description: "System report has been downloaded.",
    });
  };

  const stats = {
    farms: dataService.getFarms().length,
    schedules: dataService.getSchedules().length,
    logs: dataService.getIrrigationLogs().length,
    lastExport: localStorage.getItem('lastExport') || 'Never'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
            <p className="text-gray-600">Export, import, and manage your irrigation data</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.farms}</div>
              <div className="text-sm text-gray-600">Farms</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.schedules}</div>
              <div className="text-sm text-gray-600">Schedules</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.logs}</div>
              <div className="text-sm text-gray-600">Irrigation Logs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Download className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-gray-900">{stats.lastExport}</div>
              <div className="text-sm text-gray-600">Last Export</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="export" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="import">Import Data</TabsTrigger>
            <TabsTrigger value="reports">Generate Reports</TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2 text-green-600" />
                  Export System Data
                </CardTitle>
                <CardDescription>
                  Download all your irrigation data for backup or transfer to another system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Export Includes:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• All farm registrations and details</li>
                    <li>• Irrigation schedules and configurations</li>
                    <li>• Historical irrigation logs and water usage</li>
                    <li>• User preferences and settings</li>
                    <li>• System metadata and timestamps</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">Complete Data Export</h4>
                    <p className="text-sm text-gray-600">
                      Export all data in JSON format for backup or migration
                    </p>
                  </div>
                  <Button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border border-white border-t-transparent rounded-full" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Important Notes:</h4>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        <li>• Keep exported files secure as they contain sensitive farm data</li>
                        <li>• Regular exports are recommended for data backup</li>
                        <li>• Exported data can be imported into any AquaWise system</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-blue-600" />
                  Import System Data
                </CardTitle>
                <CardDescription>
                  Import previously exported data or migrate from another AquaWise system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="importData">Paste JSON Data</Label>
                  <Textarea
                    id="importData"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your exported JSON data here..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {importData.trim() ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Data Ready
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600">
                        No Data
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleImport}
                    disabled={isImporting || !importData.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border border-white border-t-transparent rounded-full" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800">Warning:</h4>
                      <ul className="text-sm text-red-700 mt-1 space-y-1">
                        <li>• Importing will merge with existing data</li>
                        <li>• Duplicate entries may be created</li>
                        <li>• Consider backing up current data before importing</li>
                        <li>• This action cannot be easily undone</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Generate Reports
                </CardTitle>
                <CardDescription>
                  Create comprehensive reports for analysis and record keeping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">System Summary Report</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Comprehensive overview of all farms, schedules, and irrigation activities
                      </p>
                      <Button onClick={generateReport} className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Summary
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg opacity-75">
                      <h4 className="font-semibold text-gray-900 mb-2">Water Usage Report</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Detailed analysis of water consumption and efficiency metrics
                      </p>
                      <Button disabled className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Coming Soon
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg opacity-75">
                      <h4 className="font-semibold text-gray-900 mb-2">Farmer Activity Report</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Individual farmer performance and engagement statistics
                      </p>
                      <Button disabled className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Coming Soon
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg opacity-75">
                      <h4 className="font-semibold text-gray-900 mb-2">County Dashboard Report</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Executive summary for county government officials
                      </p>
                      <Button disabled className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Report Features:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Automated data analysis and insights</li>
                    <li>• Downloadable JSON format for further processing</li>
                    <li>• Timestamp and metadata for record keeping</li>
                    <li>• Compatible with data visualization tools</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataExportImport;
