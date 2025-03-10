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
  public city: string;
  public country: string;
  public date: string;
  public temperature: string;
  public humidity: string;
  public windSpeed: string;
  public icon: string;

  constructor() {
    this.city = '';
    this.country = '';
    this.date = '';
    this.temperature = '';
    this.humidity = '';
    this.windSpeed = '';
    this.icon = '';
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string;
  private apiKey: string;
  private cityName: string;

  constructor() {
    this.baseURL = 'https://api.openweathermap.org/';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = '';
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    try {
      const response = await fetch(query);
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching location data:", error);
      throw error;
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    if (!locationData || locationData.length === 0) {
      throw new Error("Invalid city name or location not found.");
    }
    const { lat, lon } = locationData[0];
    return { lat, lon };
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return `${this.baseURL}geo/1.0/direct?q=${this.cityName}&limit=1&appid=${this.apiKey}`
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const { lat, lon } = coordinates;
    return `${this.baseURL}data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const query = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(query);
    const coordinates = this.destructureLocationData(locationData);
    return coordinates;
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const query = this.buildWeatherQuery(coordinates);
    return await this.fetchLocationData(query);
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const currentWeather = new Weather();
    currentWeather.city = response.name;
    currentWeather.country = response.sys.country;
    currentWeather.date = new Date(response.dt * 1000).toLocaleDateString();
    currentWeather.temperature = response.main.temp;
    currentWeather.humidity = response.main.humidity;
    currentWeather.windSpeed = response.wind.speed;
    currentWeather.icon = response.weather[0].icon;
    return currentWeather;
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    return weatherData.map((day: any) => {
      const forecast = new Weather();
      forecast.city = currentWeather.city;
      forecast.country = currentWeather.country;
      forecast.date = new Date(day.dt * 1000).toLocaleDateString();
      forecast.temperature = day.temp.day;
      forecast.humidity = day.humidity;
      forecast.windSpeed = day.wind_speed;
      forecast.icon = day.weather[0].icon;
      return forecast;
    });
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    try {
      this.cityName = city;
      const coordinates = await this.fetchAndDestructureLocationData();
      
      // Fetch Current Weather
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);

      // Fetch 7-day Forecast (Requires `onecall` API)
      const forecastQuery = `${this.baseURL}data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${this.apiKey}`;
      const forecastData = await this.fetchLocationData(forecastQuery);
      
      // Call buildForecastArray
      const forecast = this.buildForecastArray(currentWeather, (forecastData as any).daily);

      return { currentWeather, forecast };
    } catch (error) {
      console.error("Error getting weather for city:", error);
      return null;
    }
  }
}

export default new WeatherService();
