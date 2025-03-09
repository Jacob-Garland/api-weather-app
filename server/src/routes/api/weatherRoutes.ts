import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', (req, res) => {
  // TODO: GET weather data from city name
  const city = req.body.city;
  const weather = WeatherService.getWeatherForCity(city);
  res.json(weather);
  // TODO: save city to search history
  HistoryService.addCity(city);
});

// TODO: GET search history
router.get('/history', async (_, res) => {
  const cities = await HistoryService.getCities();
  if (!cities) {
    res.json({ message: 'No cities searched yet' });
  } else {
  res.json(cities);
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  const id = req.params.id;
  await HistoryService.removeCity(id);
  res.json({ message: 'City deleted' });
});

export default router;
