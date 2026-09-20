import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./db.js";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "./store.js";

const app = express();
app.use(
  cors(
    process.env.CORS_ORIGIN
      ? { origin: process.env.CORS_ORIGIN.split(/[,\s]+/) }
      : {}
  )
);
app.use(express.json());

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

if (!API_KEY) {
  console.warn(
    "OPENWEATHER_API_KEY is not set. Weather calls will fail until you add it to server/.env"
  );
}

function iconToType(icon) {
  switch (icon) {
    case "01d":
      return "sunny";
    case "01n":
      return "night";
    case "02d":
      return "partly-cloudy";
    case "02n":
      return "night";
    case "03d":
    case "03n":
    case "04d":
    case "04n":
    case "50d":
    case "50n":
      return "cloudy";
    case "09d":
    case "09n":
    case "10d":
    case "10n":
      return "rain";
    case "11d":
    case "11n":
      return "storm";
    case "13d":
    case "13n":
      return "snow";
    default:
      return "cloudy";
  }
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Weather API returned ${response.status}`);
  }

  return response.json();
}

async function getCurrent(lat, lon) {
  return fetchJson(
    `${BASE_URL}/weather?units=metric&lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
}

async function getCurrentByCity(city) {
  return fetchJson(
    `${BASE_URL}/weather?units=metric&q=${encodeURIComponent(city)}&appid=${API_KEY}`
  );
}

async function getForecast(lat, lon) {
  return fetchJson(
    `${BASE_URL}/forecast?units=metric&lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
}

async function getAirQuality(lat, lon) {
  return fetchJson(
    `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
}

function aqiInfo(aqi) {
  switch (aqi) {
    case 1:
      return { label: "Good", danger: "Low" };
    case 2:
      return { label: "Fair", danger: "Low-Moderate" };
    case 3:
      return { label: "Moderate", danger: "Elevated" };
    case 4:
      return { label: "Poor", danger: "High" };
    case 5:
      return { label: "Very Poor", danger: "Severe" };
    default:
      return { label: "Moderate", danger: "Elevated" };
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

/* ================================
   FAVORITE LOCATIONS
   ================================ */

app.get("/api/favorites", async (_req, res) => {
  try {
    const favorites = await getFavorites();
    res.json({ favorites });
  } catch {
    res.status(500).json({ error: "Failed to load favorites" });
  }
});

app.post("/api/favorites", async (req, res) => {
  const { name, country, lat, lon } = req.body || {};

  if (!name || typeof lat !== "number" || typeof lon !== "number") {
    return res
      .status(400)
      .json({ error: "name, lat, and lon are required" });
  }

  try {
    const { favorite, duplicate } = await addFavorite({
      name,
      country,
      lat,
      lon,
    });

    res.status(duplicate ? 200 : 201).json({ favorite, duplicate });
  } catch {
    res.status(500).json({ error: "Failed to save favorite" });
  }
});

app.delete("/api/favorites/:id", async (req, res) => {
  try {
    const removed = await removeFavorite(req.params.id);

    if (!removed) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

app.get("/api/weather", async (req, res) => {
  const { q, lat, lon } = req.query;

  if (!API_KEY) {
    return res.status(500).json({
      error: "API key is missing. Add OPENWEATHER_API_KEY to server/.env",
    });
  }

  if (!q && !(lat && lon)) {
    return res.status(400).json({
      error: "Provide a city (q) or coordinates (lat & lon)",
    });
  }

  try {
    const current = q
      ? await getCurrentByCity(q)
      : await getCurrent(lat, lon);

    const forecast = await getForecast(current.coord.lat, current.coord.lon);

    let air = null;

    try {
      const airData = await getAirQuality(
        current.coord.lat,
        current.coord.lon
      );

      if (airData.list && airData.list[0]) {
        const item = airData.list[0];

        air = {
          aqi: item.main.aqi,
          ...aqiInfo(item.main.aqi),
          components: item.components,
        };
      }
    } catch {
      air = null;
    }

    const dailyMap = new Map();

    forecast.list.forEach((item) => {
      const day = new Date(item.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
      });

      if (!dailyMap.has(day)) {
        dailyMap.set(day, {
          day,
          icon: item.weather[0].icon,
          max: Math.round(item.main.temp_max),
          min: Math.round(item.main.temp_min),
          condition: item.weather[0].main,
          type: iconToType(item.weather[0].icon),
        });
      } else {
        const entry = dailyMap.get(day);
        entry.max = Math.max(entry.max, Math.round(item.main.temp_max));
        entry.min = Math.min(entry.min, Math.round(item.main.temp_min));
      }
    });

    const hourly = forecast.list.slice(0, 24).map((item) => ({
      dt: item.dt,
      icon: item.weather[0].icon,
      temp: Math.round(item.main.temp),
      condition: item.weather[0].main,
      type: iconToType(item.weather[0].icon),
    }));

    res.json({
      city: {
        name: current.name,
        country: current.sys.country,
        lat: current.coord.lat,
        lon: current.coord.lon,
        sunrise: current.sys.sunrise,
        sunset: current.sys.sunset,
      },
      current: {
        type: iconToType(current.weather[0].icon),
        condition: current.weather[0].main,
        description: current.weather[0].description,
        temp: current.main.temp,
        feelsLike: current.main.feels_like,
        tempMin: current.main.temp_min,
        tempMax: current.main.temp_max,
        humidity: current.main.humidity,
        windSpeed: current.wind.speed,
        pressure: current.main.pressure,
        visibility: current.visibility,
      },
      air,
      daily: [...dailyMap.values()].slice(0, 7),
      hourly,
    });
  } catch (err) {
    const message = err.message || "Unexpected error";

    if (message.toLowerCase().includes("city not found")) {
      return res.status(404).json({ error: "City not found" });
    }

    res.status(500).json({ error: message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Weather API server running on port ${PORT}`);
});

connectDatabase();