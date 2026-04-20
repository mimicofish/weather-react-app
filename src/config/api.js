const API_KEY = import.meta.env.VITE_API_KEY;

export function getWeatherUrl(city) {
    return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
}