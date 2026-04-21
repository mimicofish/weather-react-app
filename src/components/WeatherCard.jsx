function WeatherCard({ data }) {
    const weatherIcons = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': "🌦️",
        'Thunderstorm': "⛈️",
        'Snow': "❄️",
        'Mist': "🌫️"
    };

    const condition = data.weather[0].main;
    const icon = weatherIcons[condition] || '🌏';

    const desc = data.weather[0].description;
    const formattedDesc = desc.charAt(0).toUpperCase() + desc.slice(1);
    
    return (
        <div>
            <h2>{icon} {data.name}</h2>
            <p>{data.main.temp} ⁰C</p>
            <p>{formattedDesc}</p>
        </div>
    );
}

export default WeatherCard;