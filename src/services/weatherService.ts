
// Real weather service using OpenWeatherMap API
export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  description: string;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  description: string;
}

class WeatherService {
  private apiKey: string = ''; // Will be set by user input for now
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('weather_api_key', key);
  }

  getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('weather_api_key') || '';
    }
    return this.apiKey;
  }

  async getCurrentWeather(location: string): Promise<WeatherData> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      // Return mock data if no API key
      return this.getMockWeatherData();
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();
      
      // Get 5-day forecast
      const forecastResponse = await fetch(
        `${this.baseUrl}/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
      );
      
      const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;
      
      return {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        rainfall: data.rain?.['1h'] || 0,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        forecast: this.processForecastData(forecastData)
      };
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getMockWeatherData();
    }
  }

  private processForecastData(forecastData: any): WeatherForecast[] {
    if (!forecastData || !forecastData.list) {
      return this.getMockForecast();
    }

    const dailyForecasts: WeatherForecast[] = [];
    const processedDates = new Set();

    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!processedDates.has(date) && dailyForecasts.length < 7) {
        dailyForecasts.push({
          date: date,
          temperature: Math.round(item.main.temp),
          humidity: item.main.humidity,
          rainfall: item.rain?.['3h'] || 0,
          description: item.weather[0].description
        });
        processedDates.add(date);
      }
    }

    return dailyForecasts;
  }

  private getMockWeatherData(): WeatherData {
    return {
      temperature: 28,
      humidity: 65,
      rainfall: 2.5,
      windSpeed: 3.2,
      description: 'Partly cloudy',
      forecast: this.getMockForecast()
    };
  }

  private getMockForecast(): WeatherForecast[] {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      return {
        date: date.toDateString(),
        temperature: 25 + Math.floor(Math.random() * 10),
        humidity: 60 + Math.floor(Math.random() * 20),
        rainfall: Math.random() * 5,
        description: ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain'][Math.floor(Math.random() * 4)]
      };
    });
  }
}

export const weatherService = new WeatherService();
