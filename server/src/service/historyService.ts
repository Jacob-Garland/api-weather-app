import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';

// TODO: Define a City class with name and id properties
class City {
  name: string;
  id: string;
  weather: [{
    name: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: string,
    windSpeed: string,
    humidity: string
  }] | null;

  constructor(name: string, id: string, weather = null) {
    this.name = name;
    this.id = id;
    this.weather = weather;
  }
}

// TODO: Complete the HistoryService class
class HistoryService {
  // TODO: Define a read method that reads from the searchHistory.json file
  private async read() {
    return await fs.readFile('db/searchHistory.json', {
      flag: 'r',
      encoding: 'utf8',
    });
  }
  private async write(cities: City[]) {
    return await fs.writeFile(
      'db/searchHistory.json',
      JSON.stringify(cities, null, '\t')
    );
  }
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    return await this.read().then((citiesJson) => {
      let parsedCities: City[];
    
      try {
        parsedCities = [].concat(JSON.parse(citiesJson));
      } catch (error) {
        parsedCities = [];
      }

      return parsedCities;
    });
  }
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string, weather: any) {
    if (!city) {
      throw new Error('City can not be blank');
    }
    const citiesArray = await this.getCities(); // get cities array
    let cityExists = false; 
    let existingCity = new City('','',null);
    
    for (let i = 0; i < citiesArray.length; i++) {
      if (city.toLowerCase() === citiesArray[i].name.toLowerCase()) { // check if city already exists in the array of cities
        cityExists = true; // set the flag if a matching name is found
        existingCity = citiesArray[i]; // Store the existing city object
        break; // exit if city exists
      }
    }
    // if it doesnt exist, create a new city objet
    if (!cityExists) {
      const newCity: City = {
        name: city,
        id: uuidv4(), // Add a unique id to the city using uuid package for delete lookup
        weather
      }
      console.log('this is a new city object with weather' + JSON.stringify(newCity));


      // Get all cities, add the new city, write all the updated cities, return the new city
      return await this.getCities()
        .then((parsedCities) => {
          return [...parsedCities, newCity]; // merge new city with parsedCities array
        })
        .then((updatedCities) => this.write(updatedCities)) // write the array to the JSON file
        .then(() => newCity); // return new city
    } else {
      console.log('City already exists: ' + city); // if city doesnt exist, log a response and return the current city
      return existingCity;
  }
}
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string) {
    return await this.getCities().then((cities: City[]): City[] => { // get parsed cities array
      return cities.filter(city => city.id !== id); // filter out passed id
    })
      .then((filteredCities) => this.write(filteredCities)) // write updated array back to file
  }
}

export default new HistoryService();
