
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Droplets, Thermometer, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { soilMoistureService, SoilMoistureReading, SoilMoistureAlert } from "@/services/soilMoistureService";
import { useToast } from "@/hooks/use-toast";
import { dataService, Crop } from "@/services/dataService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SoilMoistureTrackerProps {
  farmId: string;
  cropId?: string;
}

const SoilMoistureTracker = ({ farmId, cropId }: SoilMoistureTrackerProps) => {
  const { toast } = useToast();
  const [readings, setReadings] = useState<SoilMoistureReading[]>([]);
  const [alerts, setAlerts] = useState<SoilMoistureAlert[]>([]);
  const [latestReading, setLatestReading] = useState<SoilMoistureReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string | undefined>(cropId);

  useEffect(() => {
    const farmData = dataService.getFarm(farmId);
    if (farmData) {
      setCrops(farmData.crops);
      if (!cropId && farmData.crops.length > 0) {
        setSelectedCropId(farmData.crops[0].id);
      } else if (cropId) {
        setSelectedCropId(cropId);
      }
    }
  }, [farmId, cropId]);
  
  useEffect(() => {
    loadData();
  }, [farmId, selectedCropId]);

  const loadData = () => {
    setLoading(true);
    
    const recentReadings = soilMoistureService.getReadings(farmId, 7);
    const farmAlerts = soilMoistureService.getAlerts(farmId);
    const latest = soilMoistureService.getLatestReading(farmId, selectedCropId);
    
    setReadings(recentReadings);
    setAlerts(farmAlerts.filter(alert => !alert.acknowledged));
    setLatestReading(latest);
    setLoading(false);
  };

  const simulateNewReading = () => {
    if (!selectedCropId) {
      toast({
        title: "Select a Crop",
        description: "Please select a specific crop to simulate sensor reading.",
        variant: "destructive"
      });
      return;
    }

    const newReading = soilMoistureService.simulateReading(farmId, selectedCropId);
    loadData();
    
    toast({
      title: "New Reading Recorded",
      description: `Soil moisture: ${newReading.moistureLevel.toFixed(1)}%`,
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    soilMoistureService.acknowledgeAlert(alertId);
    loadData();
    
    toast({
      title: "Alert Acknowledged",
      description: "The soil moisture alert has been marked as resolved.",
    });
  };

  const getMoistureStatus = (level: number) => {
    if (level < 60) return { status: "Low", color: "destructive", icon: AlertTriangle };
    if (level > 85) return { status: "High", color: "warning", icon: AlertTriangle };
    return { status: "Optimal", color: "success", icon: CheckCircle };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Droplets className="h-8 w-8 animate-pulse text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-blue-600" />
              Soil Moisture Status
            </CardTitle>
            {crops.length > 0 && (
              <Select value={selectedCropId} onValueChange={setSelectedCropId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Crop" />
                </SelectTrigger>
                <SelectContent>
                  {crops.map((crop) => (
                    <SelectItem key={crop.id} value={crop.id}>{crop.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <CardDescription>Real-time soil conditions monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          {latestReading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Moisture Level */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Moisture Level</label>
                    <Badge variant={getMoistureStatus(latestReading.moistureLevel).color as any}>
                      {getMoistureStatus(latestReading.moistureLevel).status}
                    </Badge>
                  </div>
                  <Progress value={latestReading.moistureLevel} className="h-3" />
                  <p className="text-sm text-gray-600">{latestReading.moistureLevel.toFixed(1)}%</p>
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Thermometer className="h-4 w-4 mr-2 text-orange-500" />
                    <label className="text-sm font-medium">Temperature</label>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-orange-900">
                      {latestReading.temperature.toFixed(1)}°C
                    </p>
                  </div>
                </div>

                {/* pH Level */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-purple-500" />
                    <label className="text-sm font-medium">pH Level</label>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-purple-900">
                      {latestReading.pH.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Last reading: {new Date(latestReading.timestamp).toLocaleString()}</span>
                <span>Device: {latestReading.deviceId}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Droplets className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sensor Data</h3>
              <p className="text-gray-600 mb-4">
                {crops.length > 0 ? 'Select a crop to view data or simulate a new reading.' : 'No crops found for this farm.'}
              </p>
              <Button onClick={simulateNewReading} disabled={!selectedCropId}>
                Simulate Sensor Reading
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Soil Moisture Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-orange-800">
                        {alert.alertType === 'low' ? 'Low Moisture Alert' : 'High Moisture Alert'}
                      </h4>
                      <p className="text-orange-700">
                        Current: {alert.moistureLevel.toFixed(1)}% | 
                        Threshold: {alert.threshold}%
                      </p>
                      <p className="text-sm text-orange-600">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button onClick={simulateNewReading} disabled={!selectedCropId}>
          <Droplets className="h-4 w-4 mr-2" />
          Take New Reading
        </Button>
        <Button variant="outline" onClick={loadData}>
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default SoilMoistureTracker;
