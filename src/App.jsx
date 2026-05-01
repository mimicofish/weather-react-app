import { use, useEffect, useState } from 'react';
import { getWeatherUrl } from './config/api';
import './App.css';
import SearchBox from './components/SearchBox';
import WeatherCard from './components/WeatherCard';

function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debouncedCity, setDebouncedCity] = useState(city);
  
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  
  const [isLight, setIsLight] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'light';
  });

  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('history');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => { 
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  },[history]);

  useEffect(() => {
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCity(city);
    }, 500);

    return () => clearTimeout(handler);
  }, [city]);

  useEffect(() => {
    if (!debouncedCity) return;
    
    handleSearch(debouncedCity);
  }, [debouncedCity]);

  function formatCity(name) {
    return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  }

  async function handleSearch(customCity) {
    const searchCity = customCity || city;
    
    if (searchCity.trim() === '') return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(getWeatherUrl(searchCity));

      const result = await response.json();

      if (result.cod !== 200) {
        setError(result.message);
        setData(null);
        return;
      }

      setHistory(prev => {
        const normalized = searchCity.trim().toLowerCase();

        const filtered = prev.filter(
          item => item.toLowerCase() !== normalized
        );

        const formattedCity = formatCity(searchCity.trim());

        return [formattedCity, ...filtered];
      });

      setData(result);
    } catch (err) {
      setError('Something wrong');
    } finally {
      setLoading(false);
    }
  }

  function getLocationWeather() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          setLoading(true);
          setError('');

          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${import.meta.env.VITE_API_KEY}`
          );

          const result = await response.json();

          setData(result);
        } catch (err) {
          setError('Failed to get location weather');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Permission denied');
      }
    );
  }

  useEffect(() => {
    getLocationWeather();
  }, []);

  function handleFavorites(city) {
    setFavorites(prev => {
      const exists = prev.some(item => 
        item.toLowerCase() === city.toLowerCase()
    );

      if (exists) return prev;

      return [city, ...prev];
    });
  }

  function removeFromFavorites(city) {
    setFavorites(prev => 
      prev.filter(item => item.toLowerCase() !== city.toLowerCase())
    );
  }

  return ( 
    <div className={`app ${isLight ? 'light' : ''}`}>
      <h1 className='title'>Weather App 🌦️</h1>

      <button className='toggle-theme' onClick={() => setIsLight(prev => !prev)}>
        {isLight ? '🌙 Dark' : '☀️ Light'}
      </button>

      <SearchBox
        city={city}
        setCity={setCity}
        onSearch={(city) => handleSearch(city)}
        onGetLocationWeather={getLocationWeather}
        loading={loading}
      />

      {loading && <div className='loader'></div>}
      {error && <div className='error'>{error}</div>}

      {history.length > 0 && 
      <p 
        className='history-title'
        onClick={() => setShowHistory(prev => !prev)}
      >
        📜 History: {showHistory ? '🔺' : '🔻'}
      </p>}

      <div className={`history-list ${showHistory ? 'show' : ''}`}>
        {history.map((item) => (
          <p className={`history-item ${item.toLowerCase() === data?.name.toLowerCase() ? 'active' : ''}`} 
          key={item} 
          onClick={() => {
            handleSearch(item);
          }}>{item === data?.name && '📍'} {item}</p>
        ))}
      </div>

      {data && (<WeatherCard 
      data={data} 
      onFavorite={handleFavorites} 
      onRemoveFavorite={removeFromFavorites}
      />)}      

      {!data && !loading && !error && (
        <p className='placeholder'
        >Search for a city to see the weather 🌏</p>)}

      {favorites.length > 0 && 
      <p 
        className='favorites-title'
        onClick={() => setShowFavorites(prev => !prev)}
      >
        ⭐ Favorites: {showFavorites ? '🔺' : '🔻'}
      </p>}

      <div className={`favorites-list ${showFavorites ? 'show' : ''}`}>
        {favorites.map((city) => (
          <p className={`favorites-item ${city.toLowerCase() === data?.name.toLowerCase() ?'active' : ''}`} 
          key={city} 
          onClick={() => {
            handleSearch(city);
        }}>
          {city.toLowerCase() === data?.name?.toLowerCase() && '📍'}
          ⭐ {city}
        </p>
      ))}
      </div>
    </div>
  );
}

export default App;