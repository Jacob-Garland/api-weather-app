import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// TODO: Define a class for the Weather object
class Weather {
  public temperature: number;
  public humidity: string;
  public icon: string;

  constructor(temperature: number, humidity: string, icon: string) {
    this.temperature = temperature;
    this.humidity = humidity;
    this.icon = icon;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string = process.env.API_BASE_URL || ''; 
  private apiKey: string = process.env.API_KEY || '';
  private cityName: string = '';

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    try {
      this.cityName = query;
      const response = await fetch(`${this.buildGeocodeQuery()}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching location data:', error);
      return null;
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates[]): Coordinates {
    if (!locationData || locationData.length === 0) {
      throw new Error('Invalid location data');
    } return {
      lat: locationData[0].lat,
      lon: locationData[0].lon
    };
  }
  // Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.baseURL}geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${this.apiKey}`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${this.buildWeatherQuery(coordinates)}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const currentWeather = new Weather(response.current.temp, response.current.humidity, response.current.weather[0].icon);
    currentWeather.temperature = response.current.temp;
    currentWeather.humidity = response.current.humidity;
    currentWeather.icon = response.current.weather[0].icon;
    return currentWeather;
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any): any {
    if (!weatherData || !weatherData.daily) {
      throw new Error('Invalid forecast data');
    }
    return {
      current: currentWeather,
      forecast: weatherData.daily.slice(1, 6).map((day: any) => ({
        date: new Date(day.dt * 1000).toISOString().split('T')[0],
        temperature: day.temp.day,
        description: day.weather[0].description,
        icon: day.weather[0].icon,
      })),
    };
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(city);
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      return this.buildForecastArray(currentWeather, weatherData);
    } catch (error) {
      console.error('Error getting weather for city:', error);
      return null;
    }
  }
}

export default new WeatherService();
