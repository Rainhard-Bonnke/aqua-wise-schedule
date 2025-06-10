
import { weatherService, WeatherData } from "./weatherService";

export interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  startTime: string;
  endTime: string;
  affectedAreas: string[];
}

export interface WeatherUpdate {
  timestamp: string;
  location: string;
  data: WeatherData;
  alerts: WeatherAlert[];
}

class RealTimeWeatherService {
  private updateInterval: number = 30 * 60 * 1000; // 30 minutes default
  private subscribers: ((update: WeatherUpdate) => void)[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private lastUpdate: WeatherUpdate | null = null;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    const settings = localStorage.getItem('aquawise_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.updateInterval = parseInt(parsed.updateInterval || '30') * 60 * 1000;
    }
  }

  subscribe(callback: (update: WeatherUpdate) => void): () => void {
    this.subscribers.push(callback);
    
    // Send last update immediately if available
    if (this.lastUpdate) {
      callback(this.lastUpdate);
    }

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers(update: WeatherUpdate) {
    this.lastUpdate = update;
    this.subscribers.forEach(callback => callback(update));
  }

  async startRealTimeUpdates(location: string = "Homa Bay, Kenya") {
    // Clear existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Initial update
    await this.fetchWeatherUpdate(location);

    // Set up periodic updates
    this.intervalId = setInterval(async () => {
      await this.fetchWeatherUpdate(location);
    }, this.updateInterval);

    console.log(`Started real-time weather updates for ${location}, updating every ${this.updateInterval / 60000} minutes`);
  }

  stopRealTimeUpdates() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Stopped real-time weather updates');
    }
  }

  private async fetchWeatherUpdate(location: string) {
    try {
      const weatherData = await weatherService.getCurrentWeather(location);
      const alerts = this.generateWeatherAlerts(weatherData);
      
      const update: WeatherUpdate = {
        timestamp: new Date().toISOString(),
        location,
        data: weatherData,
        alerts
      };

      this.notifySubscribers(update);
      
      // Store in localStorage for persistence
      localStorage.setItem('aquawise_last_weather_update', JSON.stringify(update));
      
    } catch (error) {
      console.error('Failed to fetch weather update:', error);
    }
  }

  private generateWeatherAlerts(weatherData: WeatherData): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    const now = new Date();
    const alertEndTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    // High temperature alert
    if (weatherData.temperature > 35) {
      alerts.push({
        id: `temp-high-${now.getTime()}`,
        type: 'warning',
        title: 'High Temperature Alert',
        description: `Extremely high temperature of ${weatherData.temperature}°C. Consider increasing irrigation frequency.`,
        severity: 'high',
        startTime: now.toISOString(),
        endTime: alertEndTime.toISOString(),
        affectedAreas: ['Homa Bay County']
      });
    }

    // Heavy rainfall alert
    if (weatherData.rainfall > 10) {
      alerts.push({
        id: `rain-heavy-${now.getTime()}`,
        type: 'advisory',
        title: 'Heavy Rainfall Alert',
        description: `Heavy rainfall of ${weatherData.rainfall}mm detected. Consider reducing or skipping irrigation.`,
        severity: 'medium',
        startTime: now.toISOString(),
        endTime: alertEndTime.toISOString(),
        affectedAreas: ['Homa Bay County']
      });
    }

    // Low humidity alert
    if (weatherData.humidity < 30) {
      alerts.push({
        id: `humidity-low-${now.getTime()}`,
        type: 'watch',
        title: 'Low Humidity Alert',
        description: `Very low humidity of ${weatherData.humidity}%. Increased evaporation expected.`,
        severity: 'medium',
        startTime: now.toISOString(),
        endTime: alertEndTime.toISOString(),
        affectedAreas: ['Homa Bay County']
      });
    }

    // Check forecast for upcoming weather events
    if (weatherData.forecast && weatherData.forecast.length > 0) {
      const tomorrowForecast = weatherData.forecast[1];
      if (tomorrowForecast && tomorrowForecast.rainfall > 5) {
        alerts.push({
          id: `forecast-rain-${now.getTime()}`,
          type: 'advisory',
          title: 'Forecast: Rain Expected',
          description: `Rain expected tomorrow (${tomorrowForecast.rainfall}mm). Plan irrigation accordingly.`,
          severity: 'low',
          startTime: now.toISOString(),
          endTime: alertEndTime.toISOString(),
          affectedAreas: ['Homa Bay County']
        });
      }
    }

    return alerts;
  }

  getLastUpdate(): WeatherUpdate | null {
    // Try to get from memory first
    if (this.lastUpdate) {
      return this.lastUpdate;
    }

    // Fallback to localStorage
    const stored = localStorage.getItem('aquawise_last_weather_update');
    if (stored) {
      this.lastUpdate = JSON.parse(stored);
      return this.lastUpdate;
    }

    return null;
  }

  // Get weather recommendations based on current conditions
  getIrrigationRecommendations(weatherData: WeatherData): {
    shouldIrrigate: boolean;
    adjustmentFactor: number; // Multiply normal duration by this factor
    reason: string;
  } {
    let shouldIrrigate = true;
    let adjustmentFactor = 1.0;
    let reason = "Normal irrigation recommended";

    // Heavy rainfall - skip irrigation
    if (weatherData.rainfall > 5) {
      shouldIrrigate = false;
      reason = "Skip irrigation due to recent rainfall";
    }
    // High temperature and low humidity - increase irrigation
    else if (weatherData.temperature > 30 && weatherData.humidity < 40) {
      adjustmentFactor = 1.3;
      reason = "Increase irrigation due to high temperature and low humidity";
    }
    // Moderate temperature and high humidity - reduce irrigation
    else if (weatherData.temperature < 25 && weatherData.humidity > 80) {
      adjustmentFactor = 0.8;
      reason = "Reduce irrigation due to cool temperature and high humidity";
    }
    // High humidity - slight reduction
    else if (weatherData.humidity > 70) {
      adjustmentFactor = 0.9;
      reason = "Slightly reduce irrigation due to high humidity";
    }
    // High temperature - slight increase
    else if (weatherData.temperature > 32) {
      adjustmentFactor = 1.2;
      reason = "Increase irrigation due to high temperature";
    }

    return {
      shouldIrrigate,
      adjustmentFactor,
      reason
    };
  }

  // Update settings and restart service if needed
  updateSettings(newUpdateInterval: number) {
    this.updateInterval = newUpdateInterval * 60 * 1000; // Convert minutes to milliseconds
    
    // Restart if currently running
    if (this.intervalId) {
      this.stopRealTimeUpdates();
      this.startRealTimeUpdates();
    }
  }
}

export const realTimeWeatherService = new RealTimeWeatherService();
