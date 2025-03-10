import path from 'path';
import { promises as fs } from 'fs';

const __dirname = path.resolve();

// TODO: Define a City class with name and id properties
class City {
  public name: string;
  public id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
} // Double check this

// TODO: Complete the HistoryService class
class HistoryService {
  private filePath: string;
  constructor() {
    this.filePath = path.join(__dirname, '../../db/searchHistory.json');
  }
  // TODO: Define a read method that reads from the searchHistory.json file
  private async read() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading history", error);
      return [];
    }
  }
  private async write(cities: City[]): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2), 'utf-8');
    } catch (error) {
      console.error("Error writing history", error);
    }
  }
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities(): Promise<City[]> {
    return await this.read();
  }
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: City): Promise<void> {
    const cities = await this.read();
    if (!cities.some((c: City) => c.id === city.id)) {
      cities.push(city);
      await this.write(cities);
    }
  }
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string) {
    const cities = await this.getCities();
    const newCities: City[] = cities.filter((city: City) => city.id !== id);
    await this.write(newCities);
  }
}

export default new HistoryService();
