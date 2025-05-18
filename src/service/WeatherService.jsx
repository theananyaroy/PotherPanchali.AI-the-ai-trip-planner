import axios from "axios";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = "http://api.weatherapi.com/v1/forecast.json";

/**
 * Fetches the weather forecast for a given city and duration.
 * @param {string} city - Destination city.
 * @param {number} duration - Number of days for the forecast (1-10).
 * @returns {Promise<object>} - Weather data object.
 */
export const getWeatherForecast = async (city, duration) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: WEATHER_API_KEY,
        q: city,
        days: duration,
        aqi: "no",
        alerts: "no",
      },
    });

    if (response.status === 200) {
      const data = response.data;

      // Convert forecast data into an object format
      const forecastObject = data.forecast.forecastday.reduce((acc, day, index) => {
        acc[`day${index +1}`] = {
          date: day.date,
          maxTemp: `${day.day.maxtemp_c}°C`,
          minTemp: `${day.day.mintemp_c}°C`,
          condition: day.day.condition.text,
          humidity: `${day.day.avghumidity}%`,
          windSpeed: `${day.day.maxwind_kph} km/h`,
        };
        return acc;
      }, {});

      return forecastObject;
    } else {
      return { error: "Weather data not available." };
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return { error: "Failed to fetch weather data." };
  }
};
