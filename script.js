let weather = {
  apiKey: "67b92f0af5416edbfe58458f502b0a31",

  fetchWeather: function (city) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${this.apiKey}`
    )
      .then((response) => {
        if (!response.ok) {
          alert("No weather found.");
          throw new Error("No weather found.");
        }
        return response.json();
      })
      .then((data) => {
        this.displayWeather(data);
        this.updateDateTime();

        const { temp, humidity } = data.main;
        const dewPoint = this.calculateDewPoint(temp, humidity);
        document.querySelector(
          ".dew-point"
        ).innerText = `Dew point: ${dewPoint.toFixed(1)}°C`;
      })
      .catch((error) => console.error("Error fetching weather data:", error));

    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${this.apiKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        this.displayHourlyForecast(data.list);
        this.displayDailyForecast(data.list);
      })
      .catch((error) => console.error("Error fetching forecast data:", error));
  },

  calculateDewPoint: function (temp, humidity) {
    const a = 17.62;
    const b = 243.12;
    const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return dewPoint;
  },

  getWindDescription: function (speed) {
    if (speed <= 0.2) return "Calm";
    else if (speed <= 1.5) return "Light Air";
    else if (speed <= 3.3) return "Light Breeze";
    else if (speed <= 5.4) return "Gentle Breeze";
    else if (speed <= 7.9) return "Moderate Breeze";
    else if (speed <= 10.7) return "Fresh Breeze";
    else if (speed <= 13.8) return "Strong Breeze";
    else if (speed <= 17.1) return "High Wind";
    else if (speed <= 20.7) return "Gale";
    else if (speed <= 24.4) return "Strong Gale";
    else if (speed <= 28.4) return "Storm";
    else if (speed <= 32.6) return "Violent Storm";
    else return "Hurricane";
  },

  displayWeather: function (data) {
    const { name, sys } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity, feels_like, pressure, dew_point } = data.main;
    const { speed, deg } = data.wind;
    const { visibility } = data;

    const windDirection = this.convertWindDirection(deg);
    const windDescription = this.getWindDescription(speed);

    const visibilityInKm = (visibility / 1000).toFixed(1);

    document.querySelector(".city").innerText = ` ${name},${sys.country}`;
    document.querySelector(
      ".icon"
    ).src = `https://openweathermap.org/img/wn/${icon}.png`;
    document.querySelector(".description").innerText =
      this.capitalize(description);
    document.querySelector(".temp").innerText = `${temp}°C`;
    document.querySelector(".humidity").innerText = `Humidity: ${humidity}%`;
    document.querySelector(
      ".wind"
    ).innerText = `Wind speed: ${speed} km/h, ${windDirection}`;
    document.querySelector(".weather").classList.remove("loading");

    document.querySelector(
      ".feels-like"
    ).innerText = `Feels like: ${feels_like}°C`;
    document.querySelector(".pressure").innerText = `Pressure: ${pressure} hPa`;
    document.querySelector(
      ".dew-point"
    ).innerText = `Dew point: ${dew_point}°C`;
    document.querySelector(
      ".visibility"
    ).innerText = `Visibility: ${visibilityInKm} km`;

    // Add the wind description after the weather description
    document.querySelector(
      ".wind-description"
    ).innerText = ` ${windDescription}`;

    document.body.style.backgroundImage = `url('https://picsum.photos/1600/900?random=${Math.floor(
      Math.random() * 1000
    )}')`;
  },

  convertWindDirection: function (degree) {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    const index = Math.round((degree % 360) / 22.5);
    return directions[index];
  },

  capitalize: function (text) {
    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  },

  updateDateTime: function () {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}`;

    document.querySelector(
      ".date-time"
    ).innerText = `${formattedDate} | ${formattedTime}`;
  },

  displayHourlyForecast: function (hourlyData) {
    const hourlyContainer = document.getElementById(
      "hourly-forecast-container"
    );
    hourlyContainer.innerHTML = "";

    for (let i = 0; i < 8; i++) {
      const forecast = hourlyData[i];
      const { dt_txt } = forecast;
      const { icon } = forecast.weather[0];
      const { temp } = forecast.main;
      const hour = new Date(dt_txt).getHours();

      const hourlyItem = document.createElement("div");
      hourlyItem.classList.add("hourly-item");
      hourlyItem.innerHTML = `
          <p>${hour.toString().padStart(2, "0")}:00</p>
          <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Icon">
          <p>${Math.round(temp)}°C</p>
        `;
      hourlyContainer.appendChild(hourlyItem);
    }
  },

  displayDailyForecast: function (data) {
    const dailyContainer = document.getElementById("daily-forecast-container");
    dailyContainer.innerHTML = "";

    const dailyTemps = {};

    data.forEach((forecast) => {
      const date = forecast.dt_txt.split(" ")[0];
      if (!dailyTemps[date]) {
        dailyTemps[date] = {
          temps: [],
          icon: forecast.weather[0].icon,
        };
      }
      dailyTemps[date].temps.push(forecast.main.temp);
    });

    Object.keys(dailyTemps).forEach((date) => {
      const dayTemps = dailyTemps[date];
      const minTemp = Math.min(...dayTemps.temps);
      const maxTemp = Math.max(...dayTemps.temps);
      const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
      });

      const dailyItem = document.createElement("div");
      dailyItem.classList.add("daily-item");
      dailyItem.innerHTML = `
        <p>${dayOfWeek}</p>
        <img src="https://openweathermap.org/img/wn/${
          dayTemps.icon
        }.png" alt="Icon">
        <p>Min: ${Math.round(minTemp)}°C</p>
        <p>Max: ${Math.round(maxTemp)}°C</p>
      `;
      dailyContainer.appendChild(dailyItem);
    });
  },

  search: function () {
    const city = document.querySelector(".search-bar").value;
    this.fetchWeather(city);
  },
};

document.querySelector("#search-button").addEventListener("click", () => {
  weather.search();
});

document.querySelector(".search-bar").addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    weather.search();
  }
});

weather.fetchWeather("Kolkata,IN");

setInterval(() => {
  weather.updateDateTime();
}, 60000);

weather.updateDateTime();
