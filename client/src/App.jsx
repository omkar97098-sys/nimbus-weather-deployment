import {
  Search,
  MapPin,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  Sun,
  Shirt,
  ShieldAlert,
  Car,
  Footprints,
  HeartPulse,
  Umbrella,
  Snowflake,
  Moon,
  Zap,
  Home,
  Coffee,
  Clock,
  Map,
  Thermometer,
  Activity,
  Star,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import "./App.css";

function formatClock(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function tsToMinutes(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.getHours() * 60 + date.getMinutes();
}

function App() {
  const [weatherType, setWeatherType] = useState("sunny");
  const [forecastMode, setForecastMode] = useState("days");
  const [mapMode, setMapMode] = useState("map");
  const [atmosphereOverride, setAtmosphereOverride] = useState("auto");

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityInput, setCityInput] = useState("");
  const [favorites, setFavorites] = useState([]);

  const loadWeather = async (params) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`/api/weather?${query}`);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "Failed to load weather");
    }

    return response.json();
  };

  const fetchWeather = async (params) => {
    setLoading(true);
    setError(null);

    try {
      const data = await loadWeather(params);
      setWeather(data);
      setWeatherType(data.current.type);
      setAtmosphereOverride("auto");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    loadWeather({ q: "Hyderabad" })
      .then((data) => {
        if (cancelled) return;

        setWeather(data);
        setWeatherType(data.current.type);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const runSearch = () => {
    const city = cityInput.trim();
    if (!city) {
      setError("Enter a city name to search");
      return;
    }

    fetchWeather({ q: city });
  };

  const handleSearchKeyDown = (event) => {
    if (event.key !== "Enter") return;

    runSearch();
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setLoading(false);
        setError("Location access was denied");
      }
    );
  };

  useEffect(() => {
    let cancelled = false;

    fetch("/api/favorites")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load favorites");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setFavorites(data.favorites || []);
      })
      .catch(() => {
        if (!cancelled) setFavorites([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveCurrent = async () => {
    if (!hasLive || currentSaved) return;

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: weather.city.name,
          country: weather.city.country || "",
          lat: weather.city.lat,
          lon: weather.city.lon,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save favorite");
        return;
      }

      setFavorites((prev) =>
        prev.some((f) => f._id === data.favorite._id)
          ? prev
          : [data.favorite, ...prev]
      );
    } catch {
      setError("Failed to save favorite");
    }
  };

  const removeFavorite = async (id) => {
    try {
      await fetch(`/api/favorites/${id}`, { method: "DELETE" });
      setFavorites((prev) => prev.filter((f) => f._id !== id));
    } catch {
      setError("Failed to remove favorite");
    }
  };

  const openFavorite = (favorite) => {
    fetchWeather({ lat: favorite.lat, lon: favorite.lon });
  };

  const weatherData = {
    sunny: {
      icon: "☀️",
      condition: "Sunny",
      badge: "CLEAR SKY",
      summary: "Bright sunshine with a warm and comfortable atmosphere.",
    },
    "partly-cloudy": {
      icon: "⛅",
      condition: "Partly Cloudy",
      badge: "PARTLY CLOUDY",
      summary: "A mix of sunshine and clouds throughout the day.",
    },
    cloudy: {
      icon: "☁️",
      condition: "Cloudy",
      badge: "CLOUDY",
      summary: "Clouds dominate the sky with a cool and calm atmosphere.",
    },
    rain: {
      icon: "🌧️",
      condition: "Rain",
      badge: "RAINY",
      summary: "Light rain is falling with a cool and refreshing breeze.",
    },
    storm: {
      icon: "⛈️",
      condition: "Thunderstorm",
      badge: "STORM ALERT",
      summary: "Thunderstorms are active with strong winds and heavy clouds.",
    },
    snow: {
      icon: "🌨️",
      condition: "Snow",
      badge: "SNOW",
      summary: "Cold conditions with gentle snowfall across the area.",
    },
    night: {
      icon: "🌙",
      condition: "Clear Night",
      badge: "NIGHT SKY",
      summary: "A calm night with clear skies and visible stars.",
    },
  };

  const overrideActive = atmosphereOverride !== "auto";
  const displayType = overrideActive ? atmosphereOverride : weatherType;

  const currentWeather = weatherData[displayType];

  const hasLive = Boolean(weather);

  const displayCondition =
    hasLive && !overrideActive
      ? weather.current.condition
      : currentWeather.condition;
  const displaySummary =
    hasLive && !overrideActive
      ? weather.current.description
      : currentWeather.summary;
  const displayBadge =
    hasLive && !overrideActive
      ? weather.current.condition.toUpperCase()
      : currentWeather.badge;
  const displayIcon = currentWeather.icon;

  const displayTemp = hasLive
    ? `${Math.round(weather.current.temp)}°`
    : "29°";
  const displayFeels = hasLive
    ? `${Math.round(weather.current.feelsLike)}°`
    : "31°";
  const displayHumidity = hasLive
    ? `${Math.round(weather.current.humidity)}%`
    : "65%";
  const displayWind = hasLive
    ? `${Math.round(weather.current.windSpeed)} km/h`
    : "12 km/h";
  const displayPressure = hasLive
    ? `${Math.round(weather.current.pressure)} hPa`
    : "1012 hPa";
  const displayVisibility = hasLive
    ? `${(weather.current.visibility / 1000).toFixed(1)} km`
    : "10 km";

  const displayCity = hasLive ? weather.city.name : "Hyderabad";
  const currentSaved =
    hasLive &&
    favorites.some(
      (f) =>
        Math.abs(f.lat - weather.city.lat) < 0.01 &&
        Math.abs(f.lon - weather.city.lon) < 0.01
    );
  const displayRegion = hasLive ? weather.city.country : "Telangana, India";

  const mapLat = hasLive ? weather.city.lat : 17.385;
  const mapLon = hasLive ? weather.city.lon : 78.4867;
  const MAP_SPAN = 0.6;
  const mapEmbedSrc =
    "https://www.openstreetmap.org/export/embed.html?bbox=" +
    `${mapLon - MAP_SPAN}%2C${mapLat - MAP_SPAN}%2C${mapLon + MAP_SPAN}%2C${mapLat + MAP_SPAN}` +
    `&layer=mapnik&marker=${mapLat}%2C${mapLon}`;

  const airComponentMeta = [
    { name: "PM2.5", key: "pm2_5", unit: "µg/m³" },
    { name: "PM10", key: "pm10", unit: "µg/m³" },
    { name: "O3", key: "o3", unit: "µg/m³" },
    { name: "NO2", key: "no2", unit: "µg/m³" },
    { name: "SO2", key: "so2", unit: "µg/m³" },
    { name: "CO", key: "co", unit: "µg/m³" },
  ];

  const demoAirComponents = {
    pm2_5: 12.3,
    pm10: 45.6,
    o3: 78.5,
    no2: 21.4,
    so2: 8.2,
    co: 310,
  };

  const liveComponents =
    hasLive && weather.air && weather.air.components
      ? weather.air.components
      : null;

  const airItems = airComponentMeta.map((c) => ({
    ...c,
    value:
      liveComponents && liveComponents[c.key] != null
        ? liveComponents[c.key]
        : demoAirComponents[c.key],
  }));

  const displayAqi =
    hasLive && weather.air ? weather.air.aqi : 3;

  const airMeta = {
    1: {
      label: "Good",
      danger: "Low",
      color: "#22c55e",
      hint: "Air quality is excellent. Enjoy outdoor activities freely.",
    },
    2: {
      label: "Fair",
      danger: "Low-Moderate",
      color: "#84cc16",
      hint: "Air is acceptable. Sensitive people should watch exposure.",
    },
    3: {
      label: "Moderate",
      danger: "Elevated",
      color: "#f59e0b",
      hint: "Sensitive groups should limit prolonged outdoor exertion.",
    },
    4: {
      label: "Poor",
      danger: "High",
      color: "#f97316",
      hint: "Everyone may notice effects. Avoid heavy outdoor activity.",
    },
    5: {
      label: "Very Poor",
      danger: "Severe",
      color: "#dc2626",
      hint: "Health alert. Stay indoors and keep windows closed.",
    },
  }[displayAqi] || {
    label: "Moderate",
    danger: "Elevated",
    color: "#f59e0b",
    hint: "Sensitive groups should limit prolonged outdoor exertion.",
  };

  const sunriseTimestamp = hasLive ? weather.city.sunrise : null;
  const sunsetTimestamp = hasLive ? weather.city.sunset : null;

  const sunriseLabel = sunriseTimestamp
    ? formatClock(sunriseTimestamp)
    : "6:08 AM";
  const sunsetLabel = sunsetTimestamp
    ? formatClock(sunsetTimestamp)
    : "6:21 PM";

  const lifeTips = {
    sunny: [
      {
        icon: Sun,
        tag: "Health",
        title: "Protect Your Skin",
        text: "Apply SPF 30+ sunscreen and reapply every two hours.",
      },
      {
        icon: Shirt,
        tag: "Fashion",
        title: "Dress Light & Bright",
        text: "Wear light cotton clothing and UV-protective sunglasses.",
      },
      {
        icon: Car,
        tag: "Travel",
        title: "Plan Outdoor Activities",
        text: "Perfect day to be outside — just avoid the midday peak.",
      },
      {
        icon: Coffee,
        tag: "Hydration",
        title: "Drink More Water",
        text: "Hot sunshine increases dehydration; carry water everywhere.",
      },
    ],
    "partly-cloudy": [
      {
        icon: Footprints,
        tag: "Outdoors",
        title: "Ideal Walk Weather",
        text: "Great for walks, hikes, and casual outdoor time.",
      },
      {
        icon: Shirt,
        tag: "Fashion",
        title: "Layer Lightly",
        text: "Mornings are cooler — carry a light jacket or scarf.",
      },
      {
        icon: Sun,
        tag: "Health",
        title: "Sensible Sun Care",
        text: "UV rays still pass through clouds; wear minimal SPF.",
      },
      {
        icon: HeartPulse,
        tag: "Mood",
        title: "Enjoy the Fresh Air",
        text: "Balanced light and temperature boost energy and mood.",
      },
    ],
    cloudy: [
      {
        icon: Home,
        tag: "Home",
        title: "Brighten Up",
        text: "Turn on warm lights to keep your mood lifted.",
      },
      {
        icon: HeartPulse,
        tag: "Health",
        title: "Stay Active",
        text: "Low sunlight can drain energy — light exercise helps.",
      },
      {
        icon: Footprints,
        tag: "Comfort",
        title: "Dress Comfortable",
        text: "Wear cozy layers; humidity can make clouds feel heavy.",
      },
      {
        icon: Droplets,
        tag: "Skin",
        title: "Moisturize Well",
        text: "Dry, cloudy air can still dehydrate skin — moisturize.",
      },
    ],
    rain: [
      {
        icon: Umbrella,
        tag: "Travel",
        title: "Gear Up for Rain",
        text: "Carry an umbrella and wear waterproof shoes.",
      },
      {
        icon: Car,
        tag: "Safety",
        title: "Drive with Caution",
        text: "Roads get slippery; keep extra braking distance.",
      },
      {
        icon: HeartPulse,
        tag: "Health",
        title: "Stay Warm & Dry",
        text: "Avoid getting soaked to lower the risk of colds.",
      },
      {
        icon: Home,
        tag: "Home",
        title: "Protect Electronics",
        text: "Keep gadgets away from open windows and leaks.",
      },
    ],
    storm: [
      {
        icon: ShieldAlert,
        tag: "Safety",
        title: "Stay Indoors",
        text: "Remain inside and away from windows during lightning.",
      },
      {
        icon: Zap,
        tag: "Electrical",
        title: "Unplug Appliances",
        text: "Unplug sensitive electronics to avoid power surges.",
      },
      {
        icon: Car,
        tag: "Travel",
        title: "Avoid Travel",
        text: "Postpone trips; flooded roads are highly dangerous.",
      },
      {
        icon: Home,
        tag: "Home",
        title: "Secure Outdoor Items",
        text: "Bring in loose furniture, plants, and decorations.",
      },
    ],
    snow: [
      {
        icon: Snowflake,
        tag: "Safety",
        title: "Bundle Up",
        text: "Layer up — protect hands, ears, and feet from frostbite.",
      },
      {
        icon: Car,
        tag: "Travel",
        title: "Drive Cautiously",
        text: "Slow down, keep distance, and clear ice off your car.",
      },
      {
        icon: Home,
        tag: "Home",
        title: "Clear Walkways",
        text: "Shovel snow and salt paths to prevent slips.",
      },
      {
        icon: Footprints,
        tag: "Outdoors",
        title: "Stay Dry & Warm",
        text: "Wear insulated waterproof boots while outside.",
      },
    ],
    night: [
      {
        icon: Moon,
        tag: "Health",
        title: "Sleep Early",
        text: "Cool, dark nights favor deep and refreshing sleep.",
      },
      {
        icon: ShieldAlert,
        tag: "Safety",
        title: "Stay in Well-Lit Areas",
        text: "If outside, keep to lit paths and stay alert.",
      },
      {
        icon: Car,
        tag: "Travel",
        title: "Be Visible",
        text: "Wear reflective clothing when near roads at night.",
      },
      {
        icon: HeartPulse,
        tag: "Mood",
        title: "Enjoy the Sky",
        text: "Clear skies make tonight perfect for stargazing.",
      },
    ],
  };

  const currentWeatherTips = lifeTips[displayType] || lifeTips.sunny;

  const sunriseMinutes = sunriseTimestamp
    ? tsToMinutes(sunriseTimestamp)
    : 6 * 60 + 8;
  const sunsetMinutes = sunsetTimestamp
    ? tsToMinutes(sunsetTimestamp)
    : 18 * 60 + 21;
  const totalDaylight = sunsetMinutes - sunriseMinutes;

  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  const elapsed = Math.min(
    Math.max(minutesNow - sunriseMinutes, 0),
    totalDaylight
  );

  const progress = elapsed / totalDaylight;
  const remainingMinutes = totalDaylight - elapsed;
  const daylightHours = Math.floor(remainingMinutes / 60);
  const daylightMins = remainingMinutes % 60;
  const percentRemaining = Math.round((1 - progress) * 100);

  const daylightRadius = 52;
  const daylightCircumference = 2 * Math.PI * daylightRadius;

  const clockTicks = Array.from({ length: 12 });

  const clockHour24 = now.getHours();
  const clockMinute = now.getMinutes().toString().padStart(2, "0");
  const clockSeconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const period = clockHour24 >= 12 ? "PM" : "AM";
  const clockHour12 = ((clockHour24 + 11) % 12) + 1;
  const clockTime = `${clockHour12}:${clockMinute} ${period}`;

  const hourHandAngle =
    ((clockHour24 % 12) + now.getMinutes() / 60) / 12 * 360;
  const minuteHandAngle = ((now.getMinutes() + clockSeconds / 60) / 60) * 360;

  const hourPattern = [
    "sunny",
    "partly-cloudy",
    "cloudy",
    "rain",
    "storm",
    "snow",
    "night",
  ];

  const hourlyForecast = Array.from({ length: 24 }, (_, index) => {
    const hourDate = new Date(now.getTime() + index * 3600000);
    const hour = hourDate.getHours();
    const label =
      index === 0
        ? "Now"
        : `${((hour + 11) % 12) + 1} ${hour >= 12 ? "PM" : "AM"}`;
    const condition = hourPattern[index % hourPattern.length];

    return {
      label,
      condition,
      icon: weatherData[condition].icon,
      temp: 22 + ((index * 3) % 9),
    };
  });

  const rainDrops = Array.from({ length: 55 });
  const snowFlakes = Array.from({ length: 35 });
  const stars = Array.from({ length: 35 });

  const forecast = [
    {
      day: "Today",
      icon: "☀️",
      high: "29°",
      low: "22°",
      condition: "Sunny",
    },
    {
      day: "Tue",
      icon: "⛅",
      high: "30°",
      low: "23°",
      condition: "Partly Cloudy",
    },
    {
      day: "Wed",
      icon: "☁️",
      high: "28°",
      low: "22°",
      condition: "Cloudy",
    },
    {
      day: "Thu",
      icon: "🌧️",
      high: "27°",
      low: "21°",
      condition: "Rain",
    },
    {
      day: "Fri",
      icon: "⛈️",
      high: "26°",
      low: "20°",
      condition: "Storm",
    },
    {
      day: "Sat",
      icon: "⛅",
      high: "29°",
      low: "22°",
      condition: "Partly Cloudy",
    },
    {
      day: "Sun",
      icon: "☀️",
      high: "31°",
      low: "23°",
      condition: "Sunny",
    },
  ];

  const dailyForecast = hasLive
    ? weather.daily.map((day) => ({
        day: day.day,
        icon: weatherData[day.type] ? weatherData[day.type].icon : "☀️",
        high: `${day.max}°`,
        low: `${day.min}°`,
        condition: day.condition,
      }))
    : forecast;

  const hourlyFeed = hasLive
    ? weather.hourly.map((hour, index) => ({
        label: index === 0 ? "Now" : formatClock(hour.dt),
        icon: weatherData[hour.type] ? weatherData[hour.type].icon : "☀️",
        temp: hour.temp,
      }))
    : hourlyForecast;

  return (
    <div className={`app weather-${displayType}`}>
      {/* ================================
          FULL PAGE WEATHER ATMOSPHERE
      ================================= */}

      <div className="page-weather-layer">
        <div className="page-weather-gradient"></div>

        <div className="page-atmosphere-glow"></div>

        <div className="page-cloud-layer">
          <div className="page-cloud page-cloud-one"></div>
          <div className="page-cloud page-cloud-two"></div>
          <div className="page-cloud page-cloud-three"></div>
          <div className="page-cloud page-cloud-four"></div>
        </div>

        <div className="page-rain-layer">
          {rainDrops.map((_, index) => (
            <span
              key={`page-rain-${index}`}
              className="page-rain-drop"
              style={{
                "--delay": `${(index % 12) * 0.12}s`,
                "--left": `${(index * 17) % 100}%`,
                "--duration": `${0.65 + (index % 5) * 0.12}s`,
              }}
            ></span>
          ))}
        </div>

        <div className="page-snow-layer">
          {snowFlakes.map((_, index) => (
            <span
              key={`page-snow-${index}`}
              className="page-snow-flake"
              style={{
                "--delay": `${(index % 10) * 0.4}s`,
                "--left": `${(index * 23) % 100}%`,
                "--duration": `${5 + (index % 5)}s`,
              }}
            >
              ❄
            </span>
          ))}
        </div>

        <div className="page-stars-layer">
          {stars.map((_, index) => (
            <span
              key={`star-${index}`}
              className="page-star"
              style={{
                "--delay": `${(index % 8) * 0.5}s`,
                "--left": `${(index * 29) % 100}%`,
                "--top": `${(index * 37) % 75}%`,
              }}
            ></span>
          ))}
        </div>

        <div className="page-lightning-layer"></div>
      </div>

      {/* ================================
          HEADER
      ================================= */}

      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <img src="/logo.svg" alt="Nimbus logo" className="brand-logo" />
            </div>

            <div>
              <h1>NIMBUS</h1>
              <span>Smart Weather</span>
            </div>
          </div>

          <div className="search-box">
            <button
              className="search-button"
              onClick={runSearch}
              aria-label="Search city"
            >
              <Search size={20} />
            </button>

            <input
              type="text"
              placeholder="Search city..."
              aria-label="Search city"
              value={cityInput}
              onChange={(event) => setCityInput(event.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <button className="location-button" onClick={handleMyLocation}>
            <MapPin size={19} />
            <span>My Location</span>
          </button>
        </div>
      </header>

      {/* ================================
          MAIN CONTENT
      ================================= */}

      <main className="main">
        {/* LOCATION */}

        <section className="location-section">
          <div>
            <div className="location-title">
              <MapPin size={21} />
              <h2>{displayCity}</h2>

              <button
                className={`save-button ${currentSaved ? "save-saved" : ""}`}
                onClick={saveCurrent}
                disabled={!hasLive || currentSaved}
                aria-label={`Save ${displayCity} as favorite`}
                title={
                  currentSaved
                    ? "Location saved"
                    : "Save this location"
                }
              >
                <Star
                  size={17}
                  fill={currentSaved ? "currentColor" : "none"}
                />
              </button>
            </div>

            <p>{displayRegion}</p>
            <span className="updated-text">
              {loading
                ? "Fetching live weather..."
                : "Updated just now"}
            </span>

            {error && <p className="weather-error">{error}</p>}
          </div>

          {/* LIVE STATUS */}

          <div className="weather-demo">
            <label>Conditions</label>

            <div className={`live-status ${loading ? "live-loading" : ""}`}>
              <span className="live-dot"></span>

              {loading
                ? "Loading..."
                : `${displayCondition} · Live`}
            </div>

            <select
              value={atmosphereOverride}
              onChange={(event) =>
                setAtmosphereOverride(event.target.value)
              }
              aria-label="Forecast ambience"
            >
              <option value="auto">Auto</option>
              <option value="sunny">Sunny</option>
              <option value="partly-cloudy">Partly Cloudy</option>
              <option value="cloudy">Cloudy</option>
              <option value="rain">Rain</option>
              <option value="storm">Storm</option>
              <option value="snow">Snow</option>
              <option value="night">Night</option>
            </select>
          </div>
        </section>

        {/* SAVED LOCATIONS */}

        {favorites.length > 0 && (
          <section className="favorites-section">
            <span className="favorites-label">SAVED PLACES</span>

            <div className="favorites-list">
              {favorites.map((favorite) => (
                <div className="favorite-chip" key={favorite._id}>
                  <button
                    className="favorite-open"
                    onClick={() => openFavorite(favorite)}
                  >
                    <MapPin size={14} />
                    <span>
                      {favorite.name}
                      {favorite.country ? `, ${favorite.country}` : ""}
                    </span>
                  </button>

                  <button
                    className="favorite-remove"
                    onClick={() => removeFavorite(favorite._id)}
                    aria-label={`Remove ${favorite.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================================
            CURRENT WEATHER HERO
        ================================= */}

        <section className="current-weather impact-hero">
          <div className="weather-atmosphere"></div>

          <div className="sun-glow"></div>

          <div className="cloud-layer">
            <div className="hero-cloud hero-cloud-one"></div>
            <div className="hero-cloud hero-cloud-two"></div>
            <div className="hero-cloud hero-cloud-three"></div>
          </div>

          <div className="rain-layer">
            {rainDrops.slice(0, 25).map((_, index) => (
              <span
                key={`hero-rain-${index}`}
                className="hero-rain-drop"
                style={{
                  "--delay": `${(index % 8) * 0.14}s`,
                  "--left": `${(index * 19) % 100}%`,
                }}
              ></span>
            ))}
          </div>

          <div className="snow-layer">
            {snowFlakes.slice(0, 18).map((_, index) => (
              <span
                key={`hero-snow-${index}`}
                className="hero-snow-flake"
                style={{
                  "--delay": `${(index % 8) * 0.35}s`,
                  "--left": `${(index * 31) % 100}%`,
                }}
              >
                ❄
              </span>
            ))}
          </div>

          <div className="stars-layer">
            {stars.slice(0, 20).map((_, index) => (
              <span
                key={`hero-star-${index}`}
                className="hero-star"
                style={{
                  "--delay": `${(index % 7) * 0.45}s`,
                  "--left": `${(index * 27) % 100}%`,
                  "--top": `${(index * 31) % 70}%`,
                }}
              ></span>
            ))}
          </div>

          <div className="lightning-layer"></div>

          <div className="hero-content">
            <div className="weather-badge">{displayBadge}</div>

            <div
              className="hero-weather-icon"
              aria-label={displayCondition}
            >
              {displayIcon}
            </div>

            <div className="hero-main">
              <div className="hero-temperature">{displayTemp}</div>

              <div className="hero-condition">
                <h2>{displayCondition}</h2>
                <p>Feels like {displayFeels}</p>
              </div>
            </div>

            <p className="weather-summary">{displaySummary}</p>
          </div>

          {/* WEATHER STATS */}

          <div className="weather-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Droplets size={20} />
              </div>

              <div>
                <span>Humidity</span>
                <strong>{displayHumidity}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Wind size={20} />
              </div>

              <div>
                <span>Wind</span>
                <strong>{displayWind}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Gauge size={20} />
              </div>

              <div>
                <span>Pressure</span>
                <strong>{displayPressure}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Eye size={20} />
              </div>

              <div>
                <span>Visibility</span>
                <strong>{displayVisibility}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ================================
            SUNRISE / SUNSET
        ================================= */}

        <section className="sun-section">
          <div className="sun-card">
            <div className="sun-card-icon sunrise-icon">
              <Sunrise size={28} />
            </div>

            <div>
              <span>Sunrise</span>
              <strong>{sunriseLabel}</strong>
            </div>
          </div>

          <div className="sun-card">
            <div className="sun-card-icon sunset-icon">
              <Sunset size={28} />
            </div>

            <div>
              <span>Sunset</span>
              <strong>{sunsetLabel}</strong>
            </div>
          </div>
        </section>

        {/* ================================
            DAYLIGHT REMAINING
        ================================= */}

        <section className="daylight-section">
          <div className="daylight-card">
            <div className="daylight-digital">
              <Clock size={20} />

              <div>
                <span>Current Time</span>
                <strong>{clockTime}</strong>
              </div>
            </div>

            <div className="daylight-flex">
              <div className="daylight-ring">
                <svg viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r={daylightRadius}
                    className="daylight-track"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r={daylightRadius}
                    className="daylight-progress"
                    style={{
                      strokeDasharray: daylightCircumference,
                      strokeDashoffset:
                        daylightCircumference * (1 - progress),
                    }}
                    transform="rotate(-90 60 60)"
                  />

                  {clockTicks.map((_, index) => (
                    <line
                      key={`tick-${index}`}
                      className="daylight-tick"
                      x1="60"
                      y1="12"
                      x2="60"
                      y2="17"
                      transform={`rotate(${index * 30} 60 60)`}
                    />
                  ))}

                  <line
                    className="daylight-hour-hand"
                    x1="60"
                    y1="60"
                    x2="60"
                    y2="34"
                    transform={`rotate(${hourHandAngle} 60 60)`}
                  />

                  <line
                    className="daylight-minute-hand"
                    x1="60"
                    y1="60"
                    x2="60"
                    y2="18"
                    transform={`rotate(${minuteHandAngle} 60 60)`}
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="3.2"
                    className="daylight-center-dot"
                  />
                </svg>
              </div>

              <div className="daylight-info">
                <span className="daylight-kicker">DAYLIGHT</span>

                <h2>Time Left of the Day</h2>

                <div className="daylight-remaining">
                  <Clock size={20} />
                  <strong>
                    {daylightHours} hr {daylightMins} min
                  </strong>
                </div>

                <p>
                  {percentRemaining}% of daylight is still ahead — from
                  sunrise at {sunriseLabel} to sunset at {sunsetLabel}.
                </p>

                <div className="daylight-meter">
                  <span style={{ width: `${progress * 100}%` }}></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================
            AIR QUALITY & SAFETY
        ================================= */}

        <section className="air-section">
          <div className="section-heading">
            <div>
              <span>ENVIRONMENT</span>
              <h2>Air Quality & Safety</h2>
            </div>
          </div>

          <div className="air-grid">
            <div
              className="air-main-card"
              style={{ "--air-color": airMeta.color }}
            >
              <div className="air-head">
                <div>
                  <span className="air-kicker">AIR QUALITY INDEX</span>

                  <div className="air-aqi">
                    <strong>{displayAqi}</strong>
                    <span>/ 5</span>
                  </div>
                </div>

                <div className="air-badge">
                  <Activity size={18} />
                  {airMeta.label}
                </div>
              </div>

              <div className="air-meter">
                <span
                  style={{
                    width: `${(displayAqi / 5) * 100}%`,
                    background: airMeta.color,
                  }}
                ></span>
              </div>

              <div className="air-danger-row">
                <span>Danger Level</span>
                <strong style={{ color: airMeta.color }}>
                  {airMeta.danger}
                </strong>
              </div>

              <p className="air-hint">{airMeta.hint}</p>
            </div>

            <div className="air-components">
              {airItems.map((item) => (
                <div className="air-component" key={item.key}>
                  <span className="air-component-name">{item.name}</span>
                  <strong>{item.value.toFixed(1)}</strong>
                  <span className="air-component-unit">{item.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================
            LIVE MAP / THERMAL VIEW
        ================================= */}

        <section className="map-section">
          <div className="section-heading forecast-heading">
            <div>
              <span>LIVE LOCATION</span>
              <h2>Thermal & Live Map</h2>
            </div>

            <div className="forecast-toggle">
              <button
                className={mapMode === "map" ? "toggle-active" : ""}
                onClick={() => setMapMode("map")}
              >
                <Map size={14} />
                Live Map
              </button>

              <button
                className={mapMode === "thermal" ? "toggle-active" : ""}
                onClick={() => setMapMode("thermal")}
              >
                <Thermometer size={14} />
                Thermal
              </button>
            </div>
          </div>

          <div
            className={`map-card ${
              mapMode === "thermal" ? "map-thermal" : ""
            }`}
          >
            <iframe
              title={`${displayCity} — live map of the current location`}
              src={mapEmbedSrc}
              loading="lazy"
            ></iframe>

            <div className="map-thermal-overlay"></div>

            <div className="map-badge">
              <span className="map-badge-dot"></span>

              {mapMode === "thermal"
                ? "Thermal Heat View"
                : `${displayCity} · Live Map`}
            </div>
          </div>
        </section>

        {/* ================================
            7 DAY FORECAST
        ================================= */}

        <section className="forecast-section">
          <div className="section-heading forecast-heading">
            <div>
              <span>WEEK AHEAD</span>
              <h2>7-Day Forecast</h2>
            </div>

            <div className="forecast-toggle">
              <button
                className={forecastMode === "days" ? "toggle-active" : ""}
                onClick={() => setForecastMode("days")}
              >
                7 Days
              </button>

              <button
                className={forecastMode === "hours" ? "toggle-active" : ""}
                onClick={() => setForecastMode("hours")}
              >
                Hourly
              </button>
            </div>
          </div>

          {forecastMode === "days" && (
            <div className="forecast-grid">
              {dailyForecast.map((day) => (
                <div className="forecast-card" key={day.day}>
                  <span className="forecast-day">{day.day}</span>

                  <div className="forecast-icon">{day.icon}</div>

                  <span className="forecast-condition">
                    {day.condition}
                  </span>

                  <div className="forecast-temperature">
                    <strong>{day.high}</strong>
                    <span>{day.low}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {forecastMode === "hours" && (
            <div className="hourly-pattern-grid">
              {hourlyFeed.map((hour, index) => (
                <div className="hourly-pattern-card" key={`${hour.label}-${index}`}>
                  <span className="hourly-pattern-time">{hour.label}</span>

                  <div className="hourly-pattern-icon">{hour.icon}</div>

                  <strong className="hourly-pattern-temp">
                    {hour.temp}°
                  </strong>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================================
            LIFE TIPS & SAFETY
        ================================= */}

        <section className="life-tips-section">
          <div className="section-heading">
            <div>
              <span>SMART GUIDE</span>
              <h2>Life Tips & Safety</h2>
            </div>
          </div>

          <div className="life-tips-grid">
            {currentWeatherTips.map((tip) => (
              <article className="life-tip-card" key={tip.title}>
                <div className="life-tip-icon">
                  <tip.icon size={18} />
                </div>

                <div className="life-tip-body">
                  <span className="life-tip-tag">{tip.tag}</span>

                  <h3>{tip.title}</h3>

                  <p>{tip.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* ================================
          FOOTER
      ================================= */}

      <footer className="footer">
        <p>
          NIMBUS • Smart Weather Experience
        </p>

        <span>Powered by weather intelligence</span>
      </footer>
    </div>
  );
}

export default App;
