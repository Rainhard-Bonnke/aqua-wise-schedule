import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, Upload, Database, FileText, Share2, 
  CheckCircle, AlertCircle, ArrowLeft, Calendar,
  BarChart3, MapPin, Settings
} from "lucide-react";
import { supabaseDataService } from "@/services/supabaseDataService";
import { useToast } from "@/hooks/use-toast";

interface EnhancedDataExportImportProps {
  onBack: () => void;
}

const EnhancedDataExportImport = ({ onBack }: EnhancedDataExportImportProps) => {
  const { toast } = useToast();
  const [exportProgress, setExportProgress] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [exportData, setExportData] = useState("");
  const [importData, setImportData] = useState("");
  const [selectedExportOptions, setSelectedExportOptions] = useState({
    farms: true,
    schedules: true,
    logs: true,
    settings: true
  });
  const [exportFormat, setExportFormat] = useState("json");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const { data: farmsData, isLoading: isLoadingFarms } = useQuery({
    queryKey: ['farms-export'],
    queryFn: supabaseDataService.getFarms
  });

  const { data: schedulesData, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['schedules-export'],
    queryFn: () => supabaseDataService.getSchedules()
  });

  const { data: logsData, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['logs-export'],
    queryFn: () => supabaseDataService.getIrrigationLogs()
  });

  const farms = farmsData || [];
  const schedules = schedulesData || [];
  const logs = logsData || [];
  const isLoadingData = isLoadingFarms || isLoadingSchedules || isLoadingLogs;

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Get data based on selected options
      const exportObject: any = {
        exportDate: new Date().toISOString(),
        version: "1.0",
        exportOptions: selectedExportOptions
      };

      if (selectedExportOptions.farms) {
        exportObject.farms = farms;
      }
      if (selectedExportOptions.schedules) {
        exportObject.schedules = schedules;
      }
      if (selectedExportOptions.logs) {
        exportObject.logs = logs;
      }
      if (selectedExportOptions.settings) {
        const settings = localStorage.getItem('aquawise_settings');
        exportObject.settings = settings ? JSON.parse(settings) : null;
      }

      let exportString = "";
      if (exportFormat === "json") {
        exportString = JSON.stringify(exportObject, null, 2);
      } else if (exportFormat === "csv") {
        exportString = convertToCSV(exportObject);
      }

      setExportData(exportString);
      setLastExport(new Date().toISOString());

      toast({
        title: "Export Completed",
        description: "Your data has been successfully exported.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aquawise-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Your export file is being downloaded.",
    });
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: "No Data to Import",
        description: "Please paste or upload data to import.",
        variant: "destructive"
      });
      return;
    }
  
    setIsImporting(true);
    setImportProgress(0);
  
    toast({
      title: "Import Not Implemented",
      description: "Importing data via this page is currently disabled.",
      variant: "destructive"
    });
  
    setIsImporting(false);
    setImportProgress(0);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
      };
      reader.readAsText(file);
    }
  };

  const convertToCSV = (data: any): string => {
    // Simple CSV conversion for farms data
    let csv = "";
    
    if (data.farms) {
      csv += "Type,Name,Location,Size,SoilType,Crops,CreatedAt\n";
      data.farms.forEach((farm: any) => {
        csv += `Farm,"${farm.name}","${farm.location}",${farm.size},"${farm.soil_type}","${farm.crops.length} crops","${farm.created_at}"\n`;
      });
    }
    
    if (data.schedules) {
      csv += "\nType,FarmId,CropId,Frequency,Duration,BestTime,IsActive,NextIrrigation\n";
      data.schedules.forEach((schedule: any) => {
        csv += `Schedule,"${schedule.farm_id}","${schedule.crop_id}",${schedule.frequency},${schedule.duration},"${schedule.best_time}",${schedule.is_active},"${schedule.next_irrigation}"\n`;
      });
    }

    return csv;
  };

  const stats = {
    farms: farms.length,
    schedules: schedules.length,
    logs: logs.length,
    totalSize: JSON.stringify({ farms, schedules, logs }).length
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <Database className="h-12 w-12 text-green-600 animate-spin" />
        <p className="ml-4 text-lg text-gray-700">Loading data management...</p>
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
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
                <p className="text-gray-600">Export, import, and backup your irrigation data</p>
              </div>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Data Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Data Overview
              </CardTitle>
              <CardDescription>
                Current data stored in your AquaWise system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-green-100 p-3 rounded-lg mb-2">
                    <MapPin className="h-6 w-6 text-green-600 mx-auto" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.farms}</p>
                  <p className="text-sm text-gray-600">Farms</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-lg mb-2">
                    <Calendar className="h-6 w-6 text-blue-600 mx-auto" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.schedules}</p>
                  <p className="text-sm text-gray-600">Schedules</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 p-3 rounded-lg mb-2">
                    <FileText className="h-6 w-6 text-purple-600 mx-auto" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.logs}</p>
                  <p className="text-sm text-gray-600">Irrigation Logs</p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-100 p-3 rounded-lg mb-2">
                    <Database className="h-6 w-6 text-orange-600 mx-auto" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats.totalSize / 1024).toFixed(1)}KB
                  </p>
                  <p className="text-sm text-gray-600">Total Size</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="export" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="export">Export Data</TabsTrigger>
              <TabsTrigger value="import">Import Data</TabsTrigger>
              <TabsTrigger value="backup">Backup & Sync</TabsTrigger>
            </TabsList>

            {/* Export Tab */}
            <TabsContent value="export">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Download className="h-5 w-5 mr-2" />
                      Export Options
                    </CardTitle>
                    <CardDescription>
                      Choose what data to export and in which format
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Data to Export</Label>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="export-farms"
                              checked={selectedExportOptions.farms}
                              onChange={(e) => setSelectedExportOptions(prev => ({ ...prev, farms: e.target.checked }))}
                              className="rounded"
                            />
                            <label htmlFor="export-farms" className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <span>Farms & Farm Details</span>
                            </label>
                          </div>
                          <Badge variant="outline">{stats.farms} items</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="export-schedules"
                              checked={selectedExportOptions.schedules}
                              onChange={(e) => setSelectedExportOptions(prev => ({ ...prev, schedules: e.target.checked }))}
                              className="rounded"
                            />
                            <label htmlFor="export-schedules" className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span>Irrigation Schedules</span>
                            </label>
                          </div>
                          <Badge variant="outline">{stats.schedules} items</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="export-logs"
                              checked={selectedExportOptions.logs}
                              onChange={(e) => setSelectedExportOptions(prev => ({ ...prev, logs: e.target.checked }))}
                              className="rounded"
                            />
                            <label htmlFor="export-logs" className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-purple-600" />
                              <span>Irrigation Logs</span>
                            </label>
                          </div>
                          <Badge variant="outline">{stats.logs} items</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="export-settings"
                              checked={selectedExportOptions.settings}
                              onChange={(e) => setSelectedExportOptions(prev => ({ ...prev, settings: e.target.checked }))}
                              className="rounded"
                            />
                            <label htmlFor="export-settings" className="flex items-center space-x-2">
                              <Settings className="h-4 w-4 text-orange-600" />
                              <span>System Settings</span>
                            </label>
                          </div>
                          <Badge variant="outline">1 item</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="export-format">Export Format</Label>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="format-json"
                            name="format"
                            value="json"
                            checked={exportFormat === "json"}
                            onChange={(e) => setExportFormat(e.target.value)}
                          />
                          <label htmlFor="format-json">JSON (Recommended)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="format-csv"
                            name="format"
                            value="csv"
                            checked={exportFormat === "csv"}
                            onChange={(e) => setExportFormat(e.target.value)}
                          />
                          <label htmlFor="format-csv">CSV</label>
                        </div>
                      </div>
                    </div>

                    {isExporting && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Exporting data...</span>
                          <span>{exportProgress}%</span>
                        </div>
                        <Progress value={exportProgress} className="w-full" />
                      </div>
                    )}

                    <Button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isExporting ? "Exporting..." : "Generate Export"}
                    </Button>

                    {lastExport && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Last export: {new Date(lastExport).toLocaleString()}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Export Preview</CardTitle>
                    <CardDescription>
                      Review your exported data before downloading
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {exportData ? (
                      <div className="space-y-4">
                        <Textarea
                          value={exportData}
                          readOnly
                          className="h-64 text-xs font-mono"
                          placeholder="Your exported data will appear here..."
                        />
                        <div className="flex space-x-3">
                          <Button onClick={handleDownload} className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Download File
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(exportData);
                              toast({ title: "Copied to clipboard" });
                            }}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Generate an export to see the preview</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Import Tab */}
            <TabsContent value="import">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Import Data
                  </CardTitle>
                  <CardDescription>
                    Import data from a previous export or another AquaWise system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Importing data will merge with existing data. Duplicate items may be created.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="import-file">Upload File</Label>
                      <Input
                        id="import-file"
                        type="file"
                        accept=".json,.csv"
                        onChange={handleFileUpload}
                      />
                    </div>

                    <div className="text-center text-gray-500">or</div>

                    <div className="space-y-2">
                      <Label htmlFor="import-text">Paste Data</Label>
                      <Textarea
                        id="import-text"
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder="Paste your exported JSON data here..."
                        className="h-32"
                      />
                    </div>

                    {isImporting && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Importing data...</span>
                          <span>{importProgress}%</span>
                        </div>
                        <Progress value={importProgress} className="w-full" />
                      </div>
                    )}

                    <Button
                      onClick={handleImport}
                      disabled={isImporting || !importData.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isImporting ? "Importing..." : "Import Data"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Backup Tab */}
            <TabsContent value="backup">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Automatic Backup</CardTitle>
                    <CardDescription>
                      Configure automatic data backup settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable Auto Backup</p>
                        <p className="text-sm text-gray-600">Automatically backup data daily</p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Backup Frequency</Label>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Daily</Button>
                        <Button variant="outline" size="sm">Weekly</Button>
                        <Button variant="outline" size="sm">Monthly</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Backup Retention</Label>
                      <p className="text-sm text-gray-600">Keep backups for 30 days</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cloud Sync</CardTitle>
                    <CardDescription>
                      Sync your data across multiple devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Settings className="h-4 w-4" />
                      <AlertDescription>
                        Cloud sync requires a Supabase connection. Connect to Supabase for advanced backup and sync features.
                      </AlertDescription>
                    </Alert>

                    <Button variant="outline" className="w-full">
                      Connect to Cloud Storage
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default EnhancedDataExportImport;
