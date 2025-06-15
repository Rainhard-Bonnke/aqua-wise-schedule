// Soil moisture monitoring service
export interface SoilMoistureReading {
  id: string;
  farmId: string;
  cropId: string;
  moistureLevel: number; // percentage 0-100
  temperature: number; // celsius
  pH: number;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: string;
  deviceId?: string;
  notes?: string;
}

export interface SoilMoistureAlert {
  id: string;
  farmId: string;
  cropId: string;
  alertType: 'low' | 'high' | 'optimal';
  moistureLevel: number;
  threshold: number;
  timestamp: string;
  acknowledged: boolean;
}

import { realNotificationService } from "./realNotificationService";

class SoilMoistureService {
  private storagePrefix = 'aquawise_soil_';

  // Save soil moisture reading
  addReading(reading: SoilMoistureReading): void {
    const readings = this.getReadings(reading.farmId);
    readings.push(reading);
    
    // Keep only last 1000 readings per farm
    if (readings.length > 1000) {
      readings.splice(0, readings.length - 1000);
    }
    
    localStorage.setItem(`${this.storagePrefix}readings_${reading.farmId}`, JSON.stringify(readings));
    
    // Check for alerts
    this.checkMoistureAlerts(reading);
  }

  // Get readings for a farm
  getReadings(farmId: string, days: number = 30): SoilMoistureReading[] {
    const readingsData = localStorage.getItem(`${this.storagePrefix}readings_${farmId}`);
    const readings = readingsData ? JSON.parse(readingsData) : [];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return readings.filter((reading: SoilMoistureReading) => 
      new Date(reading.timestamp) >= cutoffDate
    );
  }

  // Get latest reading for a crop
  getLatestReading(farmId: string, cropId?: string): SoilMoistureReading | null {
    const readings = this.getReadings(farmId, 7);
    
    if (cropId) {
      const cropReadings = readings.filter(r => r.cropId === cropId);
      return cropReadings.length > 0 ? cropReadings[cropReadings.length - 1] : null;
    }
    
    return readings.length > 0 ? readings[readings.length - 1] : null;
  }

  // Check and create alerts
  private checkMoistureAlerts(reading: SoilMoistureReading): void {
    const optimalRange = this.getOptimalMoistureRange(reading.cropId);
    
    if (reading.moistureLevel < optimalRange.min) {
      this.createAlert({
        id: Date.now().toString(),
        farmId: reading.farmId,
        cropId: reading.cropId,
        alertType: 'low',
        moistureLevel: reading.moistureLevel,
        threshold: optimalRange.min,
        timestamp: reading.timestamp,
        acknowledged: false
      });
    } else if (reading.moistureLevel > optimalRange.max) {
      this.createAlert({
        id: Date.now().toString(),
        farmId: reading.farmId,
        cropId: reading.cropId,
        alertType: 'high',
        moistureLevel: reading.moistureLevel,
        threshold: optimalRange.max,
        timestamp: reading.timestamp,
        acknowledged: false
      });
    }
  }

  // Get optimal moisture range for crop
  private getOptimalMoistureRange(cropId: string): { min: number; max: number } {
    const ranges: Record<string, { min: number; max: number }> = {
      'maize': { min: 65, max: 85 },
      'beans': { min: 60, max: 80 },
      'tomatoes': { min: 70, max: 90 },
      'potatoes': { min: 65, max: 85 },
      'onions': { min: 60, max: 80 },
      'kale': { min: 70, max: 85 }
    };
    
    return ranges[cropId.toLowerCase()] || { min: 60, max: 80 };
  }

  // Alert management
  createAlert(alert: SoilMoistureAlert): void {
    const alerts = this.getAlerts();

    // Prevent duplicate alerts within a short time frame
    const recentAlert = alerts.find(a => 
      a.cropId === alert.cropId &&
      a.alertType === alert.alertType &&
      !a.acknowledged &&
      (new Date().getTime() - new Date(a.timestamp).getTime()) < 60 * 60 * 1000 // 1 hour
    );

    if (recentAlert) {
      console.log('Duplicate soil moisture alert suppressed.');
      return; // Don't create a new alert if a similar one exists recently
    }

    alerts.push(alert);
    localStorage.setItem(`${this.storagePrefix}alerts`, JSON.stringify(alerts));

    // Also send a real-time notification
    realNotificationService.addNotification({
        type: 'soil_moisture_alert',
        title: `${alert.alertType.charAt(0).toUpperCase() + alert.alertType.slice(1)} Soil Moisture`,
        message: `Moisture for a crop is at ${alert.moistureLevel.toFixed(1)}%. Threshold: ${alert.threshold}%.`,
        priority: 'high',
        farmId: alert.farmId,
        actionRequired: true,
        actionData: {
            alertId: alert.id,
            farmId: alert.farmId,
            cropId: alert.cropId,
            moistureLevel: alert.moistureLevel,
            threshold: alert.threshold,
            alertType: alert.alertType
        }
    });
  }

  getAlerts(farmId?: string): SoilMoistureAlert[] {
    const alertsData = localStorage.getItem(`${this.storagePrefix}alerts`);
    const alerts = alertsData ? JSON.parse(alertsData) : [];
    
    if (farmId) {
      return alerts.filter((alert: SoilMoistureAlert) => alert.farmId === farmId);
    }
    
    return alerts;
  }

  acknowledgeAlert(alertId: string): void {
    const alerts = this.getAlerts();
    const alertIndex = alerts.findIndex(alert => alert.id === alertId);
    
    if (alertIndex >= 0) {
      alerts[alertIndex].acknowledged = true;
      localStorage.setItem(`${this.storagePrefix}alerts`, JSON.stringify(alerts));
    }
  }

  // Simulate sensor data for demo
  simulateReading(farmId: string, cropId: string): SoilMoistureReading {
    const reading: SoilMoistureReading = {
      id: Date.now().toString(),
      farmId,
      cropId,
      moistureLevel: 50 + Math.random() * 40, // 50-90%
      temperature: 20 + Math.random() * 15, // 20-35°C
      pH: 6 + Math.random() * 2, // 6-8 pH
      location: {
        lat: -0.6 + (Math.random() - 0.5) * 0.1,
        lng: 34.6 + (Math.random() - 0.5) * 0.1
      },
      timestamp: new Date().toISOString(),
      deviceId: `sensor_${Math.floor(Math.random() * 100)}`,
      notes: 'Automated reading'
    };
    
    this.addReading(reading);
    return reading;
  }
}

export const soilMoistureService = new SoilMoistureService();
