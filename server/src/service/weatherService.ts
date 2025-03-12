import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: string;
  lon: string;
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
  baseURL: string = process.env.API_BASE_URL || ''; 
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
    const { lat, lon } = coordinates;
    return `data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
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
  private async fetchWeatherData(coordinates: Coordinates): Promise<{ list: any[] }> {
    try {
      const query = this.buildWeatherQuery(coordinates);
      const response = await fetch(`${this.baseURL}${query}`);
      const weatherData = await response.json() as { list: any[] };
      return weatherData;
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
      // console.log('Weather API Response:', JSON.stringify(response, null, 2));
      throw new Error('Invalid weather response: Missing required data');
    } // For debugging purposes, log the response

    const currentData = response.list[0];
    const weatherDetails = currentData.weather?.[0] || {};

    const currentWeather = new Weather(
      this.cityName,
      currentData.dt_txt,
      weatherDetails.icon,
      weatherDetails.description,
      currentData.main.temp.toString(),
      currentData.wind.speed.toString(),
      currentData.main.humidity.toString()
    );

    return currentWeather;
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: { list: any[]; }) {
    if (!weatherData || !weatherData.list || weatherData.list.length === 0) {
      throw new Error('Invalid weather data: Missing required data');
    }

    const dailyForecast: Weather[] = [];
    const seenDates = new Set(); // Track unique days to avoid duplicates

    for (const entry of weatherData.list) {
        const date = new Date(entry.dt * 1000).toISOString().split('T')[0]; // Extract YYYY-MM-DD
        if (!seenDates.has(date) && entry.weather) {
            seenDates.add(date);
            const weatherDetails = entry.weather[0] || {}; // Avoids undefined errors

            dailyForecast.push(
                new Weather(
                    this.cityName,
                    new Date(entry.dt * 1000).toISOString(),
                    weatherDetails.icon || 'N/A',
                    weatherDetails.description || 'No description available',
                    entry.main?.temp?.toString() || 'N/A', // Temperature
                    entry.wind?.speed?.toString() || 'N/A', // Wind Speed
                    entry.main?.humidity?.toString() || 'N/A' // Humidity
                )
            );

            if (dailyForecast.length === 5) break; // Limit to 5-day forecast
        }
    }

    return [currentWeather, ...dailyForecast];
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    try {
      const coordinates = await this.fetchAndDestructureLocationData(city);
      const weatherData = await this.fetchWeatherData(coordinates);
      const currentWeather = this.parseCurrentWeather(weatherData);
      const weatherArray = this.buildForecastArray(currentWeather, weatherData);
      return weatherArray;
    } catch (error) {
      console.error('Error getting weather for city:', error);
      throw error;
    }
  }
}

export default new WeatherService();
