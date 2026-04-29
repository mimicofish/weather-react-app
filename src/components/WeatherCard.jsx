function WeatherCard({ data, onFavorite, onRemoveFavorite }) {

    const condition = data.weather[0].main;
    const icon =  data.weather[0].icon;

    const desc = data.weather[0].description;
    const formattedDesc = desc.charAt(0).toUpperCase() + desc.slice(1);
    
    return (
        <div className="card">
            <img src={`https://openweathermap.org/img/wn/${icon}@2x.png`} alt={condition} />
            <h2 className="city">{data.name}</h2>
            <h1 className="temp">{Math.round(data.main.temp)} °C</h1>
            <p className="desc">{formattedDesc}</p>

            <div className="details">
                <div>
                    <span>💧</span>
                    <p>{data.main.humidity}%</p>
                </div>
                <div>
                    <span>💨</span>
                    <p>{data.wind.speed} m/s</p>
                </div>
                <div>
                    <span>🌡️</span>
                    <p>{Math.round(data.main.feels_like)} °C</p>
                </div>
            </div>

            <button onClick={() => onFavorite(data.name)}>
                ⭐ Add to Favorites
            </button>

            <button onClick={() => onRemoveFavorite(data.name)}>
                ❌ Remove 
            </button>
        </div>
    );
}

export default WeatherCard;