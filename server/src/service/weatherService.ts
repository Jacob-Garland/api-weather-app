import dotenv from 'dotenv';
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
  public temperature: number;
  public humidity: number;
  public windSpeed: number;
  public icon: string;

  constructor() {
    this.city = '';
    this.country = '';
    this.date = '';
    this.temperature = 0;
    this.humidity = 0;
    this.windSpeed = 0;
    this.icon = '';
  }
} // Double check this

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string;
  private apiKey: string;
  private cityName: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    this.cityName = '';
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    const response = await fetch(query);
    const data = await response.json();
    return data;
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const { lat, lon } = locationData;
    return { lat, lon };
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    const query = `${this.baseURL}geocode?city=${this.cityName}&apiKey=${this.apiKey}`;
    return query
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const { lat, lon } = coordinates;
    const query = `${this.baseURL}weather?lat=${lat}&lon=${lon}&apiKey=${this.apiKey}`;
    return query;
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
    const response = await fetch(query);
    const data = await response.json();
    return data;
  }
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const currentWeather = new Weather();
    currentWeather.city = response.city_name;
    currentWeather.country = response.country_code;
    currentWeather.date = response.ob_time;
    currentWeather.temperature = response.temp;
    currentWeather.humidity = response.rh;
    currentWeather.windSpeed = response.wind_spd;
    currentWeather.icon = response.weather.icon;
    return currentWeather;
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const forecastArray = weatherData.map((day: any) => {
      const forecast = new Weather();
      forecast.city = currentWeather.city;
      forecast.country = currentWeather.country;
      forecast.date = day.valid_date;
      forecast.temperature = day.temp;
      forecast.humidity = day.rh;
      forecast.windSpeed = day.wind_spd;
      forecast.icon = day.weather.icon;
      return forecast;
    });
    return forecastArray;
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const currentWeatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(currentWeatherData.data[0]);
    const forecastData = currentWeatherData.data.slice(1);
    const forecast = this.buildForecastArray(currentWeather, forecastData);
    return { currentWeather, forecast };
  }
}

export default new WeatherService();
