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
import "./App.css";

function App() {
  const forecast = [
    { day: "Today", icon: "☀️", temp: "29°C", condition: "Sunny" },
    { day: "Sat", icon: "🌤️", temp: "30°C", condition: "Partly Cloudy" },
    { day: "Sun", icon: "☁️", temp: "28°C", condition: "Cloudy" },
    { day: "Mon", icon: "🌧️", temp: "27°C", condition: "Light Rain" },
    { day: "Tue", icon: "🌦️", temp: "29°C", condition: "Showers" },
    { day: "Wed", icon: "☀️", temp: "31°C", condition: "Sunny" },
    { day: "Thu", icon: "🌤️", temp: "30°C", condition: "Partly Cloudy" },
  ];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <CloudSun size={32} />
          <span>Weatherly</span>
        </div>

        <div className="search-container">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search city..."
          />

          <button>
            Search
          </button>
        </div>

        <button className="location-button">
          <MapPin size={18} />
          My Location
        </button>
      </header>

      {/* Main Content */}
      <main className="main">

        {/* Location */}
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

        {/* Current Weather */}
        <section className="current-weather">

          <div className="temperature-section">
            <div className="weather-icon">
              ☀️
            </div>

            <div>
              <div className="temperature">
                29°
                <span>C</span>
              </div>

              <p className="condition">
                Sunny
              </p>

              <p className="feels">
                Feels like 31°C
              </p>
            </div>
          </div>

          {/* Weather Stats */}
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

        {/* Sun Information */}
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

        {/* Forecast */}
        <section className="forecast-section">

          <div className="section-heading">
            <h2>7-Day Forecast</h2>

            <span>
              Next 7 days
            </span>
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

      {/* Footer */}
      <footer className="footer">
        <p>
          Weatherly © 2026
        </p>

        <p>
          Weather information powered by a weather API
        </p>
      </footer>
    </div>
  );
}

export default App;