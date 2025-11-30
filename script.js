const apiKey = WEATHER_API_KEY;
const weatherContainer = document.getElementById('weather-container');
const loading = document.getElementById('loading');
const cityInput = document.getElementById('city-input');
const addCityBtn = document.getElementById('add-city-btn');
const currentLocationBtn = document.getElementById('current-location-btn');

let cities = [];

// Function to show loading state
function showLoading() {
    loading.style.display = 'flex';
}

// Function to hide loading state
function hideLoading() {
    loading.style.display = 'none';
}

// Function to fetch current weather
async function fetchCurrentWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('City not found');
    return await response.json();
}

// Function to fetch 3-day forecast
async function fetchForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Forecast not found');
    const data = await response.json();
    // Get next 3 days (forecast is every 3 hours, so take one per day)
    const forecast = [];
    for (let i = 0; i < 3; i++) {
        const dayIndex = i * 8; // 8 * 3 hours = 24 hours
        if (data.list[dayIndex]) {
            forecast.push(data.list[dayIndex]);
        }
    }
    return forecast;
}

// Function to get FA icon based on weather condition
function getWeatherIcon(condition) {
    const icons = {
        'Clear': 'fas fa-sun',
        'Clouds': 'fas fa-cloud',
        'Rain': 'fas fa-cloud-rain',
        'Drizzle': 'fas fa-cloud-rain',
        'Thunderstorm': 'fas fa-bolt',
        'Snow': 'fas fa-snowflake',
        'Mist': 'fas fa-smog',
        'Fog': 'fas fa-smog',
        'Haze': 'fas fa-smog'
    };
    return icons[condition] || 'fas fa-cloud'; // Default to cloud
}

// Function to render weather card
function renderWeatherCard(city, current, forecast) {
    const condition = current.weather[0].main;
    const iconClass = getWeatherIcon(condition);
    const card = document.createElement('div');
    card.className = `weather-card ${condition.toLowerCase()}`;
    card.innerHTML = `
        <h2>${city}</h2>
        <div class="current-weather">
            <i class="${iconClass} weather-icon"></i>
            <div class="temperature">${Math.round(current.main.temp)}°C</div>
            <div class="weather-description">${current.weather[0].description}</div>
        </div>
        <div class="weather-details">
            <div class="detail">
                <i class="fas fa-tint"></i>
                <p>${current.main.humidity}%</p>
                <small>Humidity</small>
            </div>
            <div class="detail">
                <i class="fas fa-wind"></i>
                <p>${Math.round(current.wind.speed)} m/s</p>
                <small>Wind</small>
            </div>
            <div class="detail">
                <i class="fas fa-thermometer-half"></i>
                <p>${Math.round(current.main.feels_like)}°C</p>
                <small>Feels Like</small>
            </div>
        </div>
        <div class="forecast">
            ${forecast.map(day => `
                <div class="forecast-day">
                    <p>${new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <i class="${getWeatherIcon(day.weather[0].main)}" style="font-size: 2rem; color: rgba(255,255,255,0.8);"></i>
                    <p>${Math.round(day.main.temp)}°C</p>
                </div>
            `).join('')}
        </div>
    `;
    weatherContainer.appendChild(card);
}

// Function to add city
async function addCity(city) {
    if (cities.includes(city.toLowerCase())) return;
    showLoading();
    try {
        const current = await fetchCurrentWeather(city);
        const forecast = await fetchForecast(city);
        cities.push(city.toLowerCase());
        renderWeatherCard(city, current, forecast);
    } catch (error) {
        alert(error.message);
    }
    hideLoading();
}

// Function to get current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            showLoading();
            try {
                const response = await fetch(url);
                const data = await response.json();
                const city = data.name;
                if (!cities.includes(city.toLowerCase())) {
                    const forecast = await fetchForecast(city);
                    cities.push(city.toLowerCase());
                    renderWeatherCard(city, data, forecast);
                }
            } catch (error) {
                alert('Unable to fetch weather for current location');
            }
            hideLoading();
        }, () => {
            alert('Geolocation access denied');
        });
    } else {
        alert('Geolocation is not supported by this browser');
    }
}

// Event listeners
addCityBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        addCity(city);
        cityInput.value = '';
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addCityBtn.click();
    }
});

currentLocationBtn.addEventListener('click', getCurrentLocation); // Direct call to geolocation
