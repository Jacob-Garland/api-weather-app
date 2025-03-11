import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  // TODO: GET weather data from city name
  try {
    const { cityName } = req.body;
    console.log('City Searched:', cityName);
    if (!cityName) {
      return res.status(400).json({ message: 'City name is required' });
    }
    const weatherArray = await WeatherService.getWeatherForCity(cityName);
  if (!weatherArray) {
    return res.status(404).json({ message: 'Weather data not found' });
  } else {
    // TODO: save city to search history
    HistoryService.addCity(cityName);
    return res.status(200).json(weatherArray);
  }
  } catch (error) {
    console.error('Error getting weather for city:', error);
    return res.status(500).json({ message: 'Error getting weather for city' });
  }
});

// TODO: GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const cities = await HistoryService.getCities();
    res.status(200).json(cities);
  } catch (error) {
    console.error('Error getting search history:', error);
    res.status(500).json({ message: 'Error getting search history' });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await HistoryService.removeCity(id);
    res.status(200).json({ message: 'City deleted' });
  }
  catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ message: 'Error deleting city' });
  }
});

export default router;
