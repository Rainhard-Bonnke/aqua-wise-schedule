
// Data persistence service with local storage
export interface Farm {
  id: string;
  name: string;
  location: string;
  size: number;
  soilType: string;
  crops: Crop[];
  createdAt: string;
}

export interface Crop {
  id: string;
  name: string;
  plantedDate: string;
  expectedHarvest: string;
  waterRequirement: 'low' | 'medium' | 'high';
  area: number;
}

export interface IrrigationSchedule {
  id: string;
  farmId: string;
  cropId: string;
  frequency: number; // days
  duration: number; // minutes
  bestTime: string;
  isActive: boolean;
  createdAt: string;
  nextIrrigation: string;
}

export interface IrrigationLog {
  id: string;
  scheduleId: string;
  farmId: string;
  date: string;
  duration: number;
  waterUsed: number; // liters
  completed: boolean;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  farms: string[];
  preferences: UserPreferences;
  createdAt: string;
}

export interface UserPreferences {
  notifications: {
    sms: boolean;
    email: boolean;
    push: boolean;
  };
  units: 'metric' | 'imperial';
  language: string;
}

class DataService {
  private storagePrefix = 'aquawise_';

  // User management
  saveUser(user: User): void {
    localStorage.setItem(`${this.storagePrefix}user`, JSON.stringify(user));
  }

  getUser(): User | null {
    const userData = localStorage.getItem(`${this.storagePrefix}user`);
    return userData ? JSON.parse(userData) : null;
  }

  // Farm management
  saveFarm(farm: Farm): void {
    const farms = this.getFarms();
    const existingIndex = farms.findIndex(f => f.id === farm.id);
    
    if (existingIndex >= 0) {
      farms[existingIndex] = farm;
    } else {
      farms.push(farm);
    }
    
    localStorage.setItem(`${this.storagePrefix}farms`, JSON.stringify(farms));
  }

  getFarms(): Farm[] {
    const farmsData = localStorage.getItem(`${this.storagePrefix}farms`);
    return farmsData ? JSON.parse(farmsData) : [];
  }

  getFarm(id: string): Farm | null {
    const farms = this.getFarms();
    return farms.find(f => f.id === id) || null;
  }

  deleteFarm(id: string): void {
    const farms = this.getFarms().filter(f => f.id !== id);
    localStorage.setItem(`${this.storagePrefix}farms`, JSON.stringify(farms));
  }

  // Schedule management
  saveSchedule(schedule: IrrigationSchedule): void {
    const schedules = this.getSchedules();
    const existingIndex = schedules.findIndex(s => s.id === schedule.id);
    
    if (existingIndex >= 0) {
      schedules[existingIndex] = schedule;
    } else {
      schedules.push(schedule);
    }
    
    localStorage.setItem(`${this.storagePrefix}schedules`, JSON.stringify(schedules));
  }

  getSchedules(farmId?: string): IrrigationSchedule[] {
    const schedulesData = localStorage.getItem(`${this.storagePrefix}schedules`);
    const schedules = schedulesData ? JSON.parse(schedulesData) : [];
    
    if (farmId) {
      return schedules.filter((s: IrrigationSchedule) => s.farmId === farmId);
    }
    
    return schedules;
  }

  deleteSchedule(id: string): void {
    const schedules = this.getSchedules().filter(s => s.id !== id);
    localStorage.setItem(`${this.storagePrefix}schedules`, JSON.stringify(schedules));
  }

  // Irrigation logs
  saveIrrigationLog(log: IrrigationLog): void {
    const logs = this.getIrrigationLogs();
    const existingIndex = logs.findIndex(l => l.id === log.id);
    
    if (existingIndex >= 0) {
      logs[existingIndex] = log;
    } else {
      logs.push(log);
    }
    
    localStorage.setItem(`${this.storagePrefix}logs`, JSON.stringify(logs));
  }

  getIrrigationLogs(farmId?: string): IrrigationLog[] {
    const logsData = localStorage.getItem(`${this.storagePrefix}logs`);
    const logs = logsData ? JSON.parse(logsData) : [];
    
    if (farmId) {
      return logs.filter((l: IrrigationLog) => l.farmId === farmId);
    }
    
    return logs;
  }

  // Analytics
  getWaterUsageAnalytics(farmId?: string, days: number = 30): {
    totalWaterUsed: number;
    averageDaily: number;
    irrigationCount: number;
    efficiency: number;
  } {
    const logs = this.getIrrigationLogs(farmId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentLogs = logs.filter(log => 
      new Date(log.date) >= cutoffDate && log.completed
    );
    
    const totalWaterUsed = recentLogs.reduce((sum, log) => sum + log.waterUsed, 0);
    const averageDaily = totalWaterUsed / days;
    const irrigationCount = recentLogs.length;
    const efficiency = irrigationCount > 0 ? (totalWaterUsed / irrigationCount) : 0;
    
    return {
      totalWaterUsed,
      averageDaily,
      irrigationCount,
      efficiency
    };
  }

  // Export/Import functionality
  exportData(): string {
    const data = {
      user: this.getUser(),
      farms: this.getFarms(),
      schedules: this.getSchedules(),
      logs: this.getIrrigationLogs(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.user) this.saveUser(data.user);
      if (data.farms) {
        data.farms.forEach((farm: Farm) => this.saveFarm(farm));
      }
      if (data.schedules) {
        data.schedules.forEach((schedule: IrrigationSchedule) => this.saveSchedule(schedule));
      }
      if (data.logs) {
        data.logs.forEach((log: IrrigationLog) => this.saveIrrigationLog(log));
      }
      
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  clearAllData(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const dataService = new DataService();
