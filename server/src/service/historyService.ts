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
  // TODO: Define a read method that reads from the searchHistory.json file
  private async read() {
    const fs = require('fs').promises;
    const data = await fs.readFile('server/db/searchHistory.json', 'utf-8');
    const cities = JSON.parse(data);
    return cities;
  }
  private async write(cities: City[]) {
    const fs = require('fs').promises;
    await fs.writeFile('server/db/searchHistory.json', JSON.stringify(cities, null, 2), 'utf-8');
  }
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    const cities = await this.read();
    return cities;
  }
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    const cities = await this.getCities();
    const id = cities.length.toString();
    const newCity = new City(city, id);
    cities.push(newCity);
    await this.write(cities);
  }
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string) {
    const cities = await this.getCities();
    const newCities: City[] = cities.filter((city: City) => city.id !== id);
    await this.write(newCities);
  }
}

export default new HistoryService();
