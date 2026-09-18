import {
  Search,
  MapPin,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  CloudSun,
} from "lucide-react";
import { useState } from "react";
import "./App.css";

function App() {
  // =========================================
  // WEATHER STATE
  // =========================================

  const [weatherType, setWeatherType] = useState("sunny");

  // =========================================
  // WEATHER DATA
  // =========================================

  const weatherData = {
    sunny: {
      icon: "☀️",
      condition: "Sunny",
      badge: "Clear skies",
      summary: "A warm and comfortable day with clear skies.",
    },

    "partly-cloudy": {
      icon: "🌤️",
      condition: "Partly Cloudy",
      badge: "Partly cloudy",
      summary: "A pleasant day with a mix of sunshine and clouds.",
    },

    cloudy: {
      icon: "☁️",
      condition: "Cloudy",
      badge: "Cloudy skies",
      summary: "Cloudy conditions are expected throughout the day.",
    },

    rain: {
      icon: "🌧️",
      condition: "Light Rain",
      badge: "Rain expected",
      summary: "Light rain is expected. Keep an umbrella nearby.",
    },

    storm: {
      icon: "⛈️",
      condition: "Thunderstorm",
      badge: "Storm warning",
      summary: "Stormy conditions are possible. Stay alert.",
    },

    snow: {
      icon: "❄️",
      condition: "Snow",
      badge: "Snow expected",
      summary: "Cold conditions with snow are expected today.",
    },

    night: {
      icon: "🌙",
      condition: "Clear Night",
      badge: "Clear night",
      summary: "A calm night with clear skies.",
    },
  };

  const currentWeather = weatherData[weatherType];

  // =========================================
  // ANIMATION ELEMENTS
  // =========================================

  const rainDrops = Array.from({ length: 45 });
  const snowFlakes = Array.from({ length: 30 });
  const stars = Array.from({ length: 28 });

  // =========================================
  // FORECAST DATA
  // =========================================

  const forecast = [
    {
      day: "Today",
      icon: "☀️",
      temp: "29°C",
      condition: "Sunny",
    },
    {
      day: "Sat",
      icon: "🌤️",
      temp: "30°C",
      condition: "Partly Cloudy",
    },
    {
      day: "Sun",
      icon: "☁️",
      temp: "28°C",
      condition: "Cloudy",
    },
    {
      day: "Mon",
      icon: "🌧️",
      temp: "27°C",
      condition: "Light Rain",
    },
    {
      day: "Tue",
      icon: "🌦️",
      temp: "29°C",
      condition: "Showers",
    },
    {
      day: "Wed",
      icon: "☀️",
      temp: "31°C",
      condition: "Sunny",
    },
    {
      day: "Thu",
      icon: "🌤️",
      temp: "30°C",
      condition: "Partly Cloudy",
    },
  ];

  return (
    <div className={`app weather-${weatherType}`}>
      {/* =========================================
          HEADER
          ========================================= */}

      <header className="header">
        <div className="brand">
          <CloudSun size={32} />
          <span>NIMBUS</span>
        </div>

        <div className="search-container">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search city..."
          />

          <button type="button">
            Search
          </button>
        </div>

        <button
          type="button"
          className="location-button"
        >
          <MapPin size={18} />
          My Location
        </button>
      </header>

      {/* =========================================
          MAIN
          ========================================= */}

      <main className="main">
        {/* LOCATION */}

        <section className="location-section">
          <div>
            <p className="label">CURRENT WEATHER</p>

            <h1>Hyderabad</h1>

            <p className="country">
              Telangana, India
            </p>
          </div>

          <p className="updated">
            Updated just now
          </p>
        </section>

        {/* =========================================
            WEATHER DEMO
            TEMPORARY TESTING CONTROL
            ========================================= */}

        <div className="weather-demo">
          <label htmlFor="weather-select">
            Weather Demo
          </label>

          <select
            id="weather-select"
            value={weatherType}
            onChange={(event) =>
              setWeatherType(event.target.value)
            }
          >
            <option value="sunny">
              ☀️ Sunny
            </option>

            <option value="partly-cloudy">
              🌤️ Partly Cloudy
            </option>

            <option value="cloudy">
              ☁️ Cloudy
            </option>

            <option value="rain">
              🌧️ Rain
            </option>

            <option value="storm">
              ⛈️ Storm
            </option>

            <option value="snow">
              ❄️ Snow
            </option>

            <option value="night">
              🌙 Night
            </option>
          </select>
        </div>

        {/* =========================================
            CURRENT WEATHER HERO
            ========================================= */}

        <section className="current-weather impact-hero">
          {/* Base atmosphere */}
          <div className="weather-atmosphere" />

          {/* Sun glow */}
          <div className="sun-glow" />

          {/* Clouds */}
          <div className="cloud-layer">
            <div className="cloud cloud-one" />
            <div className="cloud cloud-two" />
            <div className="cloud cloud-three" />
          </div>

          {/* Rain */}
          <div className="rain-layer">
            {rainDrops.map((_, index) => (
              <span
                className="rain-drop"
                key={`rain-${index}`}
                style={{
                  "--rain-left": `${(index * 37) % 100}%`,
                  "--rain-delay": `${(index * 0.13) % 3}s`,
                  "--rain-duration": `${
                    0.65 + ((index * 17) % 40) / 100
                  }s`,
                }}
              />
            ))}
          </div>

          {/* Snow */}
          <div className="snow-layer">
            {snowFlakes.map((_, index) => (
              <span
                className="snow-flake"
                key={`snow-${index}`}
                style={{
                  "--snow-left": `${(index * 29) % 100}%`,
                  "--snow-delay": `${(index * 0.27) % 5}s`,
                  "--snow-duration": `${
                    4 + ((index * 13) % 35) / 10
                  }s`,
                }}
              >
                ❄
              </span>
            ))}
          </div>

          {/* Night stars */}
          <div className="stars-layer">
            {stars.map((_, index) => (
              <span
                className="star"
                key={`star-${index}`}
                style={{
                  "--star-left": `${(index * 43) % 100}%`,
                  "--star-top": `${10 + ((index * 31) % 65)}%`,
                  "--star-delay": `${(index * 0.4) % 4}s`,
                }}
              />
            ))}
          </div>

          {/* Lightning */}
          <div className="lightning-layer">
            <div className="lightning-flash" />
          </div>

          {/* =====================================
              HERO CONTENT
              ===================================== */}

          <div className="hero-content">
            <div className="hero-location">
              <span>Today in Hyderabad</span>

              <div className="weather-badge">
                <span>
                  {currentWeather.badge}
                </span>
              </div>
            </div>

            <div className="hero-main">
              <div className="hero-weather-icon">
                {currentWeather.icon}
              </div>

              <div className="hero-temperature">
                <div className="temperature">
                  29<span>°C</span>
                </div>

                <p className="condition">
                  {currentWeather.condition}
                </p>

                <p className="feels">
                  Feels like 31°C
                </p>
              </div>
            </div>

            <p className="weather-summary">
              {currentWeather.summary}
            </p>
          </div>

          {/* =====================================
              WEATHER STATS
              ===================================== */}

          <div className="weather-stats">
            <div className="stat">
              <Droplets size={22} />

              <div>
                <span>Humidity</span>
                <strong>65%</strong>
              </div>
            </div>

            <div className="stat">
              <Wind size={22} />

              <div>
                <span>Wind Speed</span>
                <strong>12 km/h</strong>
              </div>
            </div>

            <div className="stat">
              <Gauge size={22} />

              <div>
                <span>Pressure</span>
                <strong>1012 hPa</strong>
              </div>
            </div>

            <div className="stat">
              <Eye size={22} />

              <div>
                <span>Visibility</span>
                <strong>10 km</strong>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SUNRISE / SUNSET
            ========================================= */}

        <section className="sun-section">
          <div className="sun-card">
            <Sunrise size={24} />

            <div>
              <span>Sunrise</span>
              <strong>6:02 AM</strong>
            </div>
          </div>

          <div className="sun-card">
            <Sunset size={24} />

            <div>
              <span>Sunset</span>
              <strong>6:18 PM</strong>
            </div>
          </div>
        </section>

        {/* =========================================
            7-DAY FORECAST
            ========================================= */}

        <section className="forecast-section">
          <div className="section-heading">
            <h2>7-Day Forecast</h2>

            <span>Next 7 days</span>
          </div>

          <div className="forecast-grid">
            {forecast.map((item, index) => (
              <div
                className={`forecast-card ${
                  index === 0 ? "active" : ""
                }`}
                key={item.day}
              >
                <p className="forecast-day">
                  {item.day}
                </p>

                <div className="forecast-icon">
                  {item.icon}
                </div>

                <strong className="forecast-temp">
                  {item.temp}
                </strong>

                <span className="forecast-condition">
                  {item.condition}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* =========================================
          FOOTER
          ========================================= */}

      <footer className="footer">
        <p>NIMBUS © 2026</p>

        <p>
          Weather information powered by a weather API
        </p>
      </footer>
    </div>
  );
}

export default App;