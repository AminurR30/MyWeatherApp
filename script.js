let weather = {
  apiKey: "67b92f0af5416edbfe58458f502b0a31",

  fetchWeather: function (city) {
    // Fetch current weather
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
      .then((data) => this.displayWeather(data));

    // Fetch 5-day/3-hour forecast
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

  displayWeather: function (data) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity } = data.main;
    const { speed } = data.wind;

    document.querySelector(".city").innerText = `Weather in ${name}`;
    document.querySelector(
      ".icon"
    ).src = `https://openweathermap.org/img/wn/${icon}.png`;
    document.querySelector(".description").innerText = description;
    document.querySelector(".temp").innerText = `${temp}°C`;
    document.querySelector(".humidity").innerText = `Humidity: ${humidity}%`;
    document.querySelector(".wind").innerText = `Wind speed: ${speed} km/h`;
    document.querySelector(".weather").classList.remove("loading");
    document.body.style.backgroundImage = `url('https://source.unsplash.com/1600x900/?${name}')`;
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
    dailyContainer.innerHTML = ""; // Clear previous content

    const dailyTemps = {};

    // Group forecast data by date
    data.forEach((forecast) => {
      const date = forecast.dt_txt.split(" ")[0]; // Extract date part
      if (!dailyTemps[date]) {
        dailyTemps[date] = {
          temps: [],
          icon: forecast.weather[0].icon,
        };
      }
      dailyTemps[date].temps.push(forecast.main.temp); // Collect all temps for the day
    });

    // Loop through each day and calculate min and max temps
    Object.keys(dailyTemps).forEach((date) => {
      const dayTemps = dailyTemps[date];
      const minTemp = Math.min(...dayTemps.temps); // Calculate min temp
      const maxTemp = Math.max(...dayTemps.temps); // Calculate max temp
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

weather.fetchWeather("Kolkata"); // Default city
