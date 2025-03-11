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
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: string;
  windSpeed: string;
  humidity: string;

  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: string,
    windSpeed: string,
    humidity: string) {
    this.city = city;
    this.tempF = tempF;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
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
      const response = await fetch(query);
      const locationData = await response.json();
      return locationData;
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw error;
    }
}
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates[]): Coordinates {
    const { lat, lon } = locationData[0];
    return { lat, lon };
  }
  // Create buildGeocodeQuery method
  private buildGeocodeQuery(city: string): string {
    return `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${this.apiKey}`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    try {
      this.cityName = city;
      const locationData = await this.fetchLocationData(this.buildGeocodeQuery(city));
      return this.destructureLocationData(locationData);
    } catch (error) {
      console.error('Error fetching and deconstructing location data:', error);
      throw error;
    }
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    try {
      const query = this.buildWeatherQuery(coordinates);
      const response = await fetch(`${this.baseURL}${query}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error
    }
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    if (
      !response || 
      !response.current || 
      !response.current.weather || 
      response.current.weather.length === 0
    ) {
      throw new Error('Invalid weather response: Missing required data');
    } // For debugging purposes
    
    const currentWeather = new Weather(
      this.cityName,
      new Date().toISOString(),
      response.current.weather[0].icon,
      response.current.weather[0].description,
      response.current.temp.toString(),
      response.current.wind_speed.toString(),
      response.current.humidity.toString()
    );
    return currentWeather;
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): any {
    const forecastArray = weatherData.daily.map((day: any) => {
      return new Weather(
        this.cityName,
        new Date(day.dt * 1000).toISOString(),
        day.weather[0].icon,
        day.weather[0].description,
        day.temp.day.toString(),
        day.wind_speed.toString(),
        day.humidity.toString()
      );
    });
    return [currentWeather, ...forecastArray];
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(city);
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      const forecastArray = this.buildForecastArray(currentWeather, weatherData);
      return forecastArray;
    } catch (error) {
      console.error('Error getting weather for city:', error);
      throw error;
    }
  }
}

export default new WeatherService();
