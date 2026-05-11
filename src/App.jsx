import { use, useEffect, useState, useRef } from 'react';
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

  //For dynamic background based on weather condition
  const weatherCondition = data?.weather[0]?.main;

  const [activeCity, setActiveCity] = useState('');
  const historyRef = useRef(null);
  const activeRef = useRef(null);

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

  useEffect(() => {
    if (!showHistory) return;

    const timeOut = setTimeout(() => {
      if (activeRef.current) {
        activeRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);

    return () => clearTimeout(timeOut);
  }, [activeCity, showHistory]);

  async function handleSearch(customCity, fromHistory = false) {
    const searchCity = getSearchCity(customCity);

    setActiveCity(searchCity);
    
    if (!searchCity) return;

    try {
      setLoading(true);
      setError('');

      const result = await fetchWeather(searchCity);

      if (!fromHistory) {
        handleSuccess(result, searchCity);
      } else {
        setData(result);
      }

    } catch (err) {
      handleError(err);
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
        isSameCity(item, city)
      );

      if (exists) return prev;

      return [city, ...prev];
    });
  }

  function removeFromFavorites(city) {
    setFavorites(prev => 
      prev.filter(item => !isSameCity(item, city))
    );
  }

  function normalizedCityName(name) {
    return name?.trim().toLowerCase() || '';
  }

  function isSameCity(a, b) {
    return normalizedCityName(a) === normalizedCityName(b);
  }

  function updateHistory(prevHistory, city) {
    const filtered = prevHistory.filter(item => !isSameCity(item, city));
    const formattedCity = formatCity(city);
    
    return [formattedCity, ...filtered].slice(0, 10);
  }

  function getSearchCity(customCity) {
    const value = customCity || city;

    if (!value) return '';

    return value.trim();
  }

  async function fetchWeather(city) {
    const response = await fetch(getWeatherUrl(city));

    if (!response.ok) {
      throw new Error('Network error');
    }

    const result = await response.json();

    if (result.cod !== 200) {
      throw new Error(result.message);
    }

    return result;
  }

  function handleSuccess(result, city) {
    setHistory(prev => updateHistory(prev, city));
    setData(result);
  }

  function handleError(err) {
    console.error(err);
    
    const message = 
      err instanceof Error 
        ? err.message 
        : typeof err ==='string'
        ? err 
        : 'Something went wrong';
    
    setError(message);
    setData(null);
  }

  return ( 
    <div className={`app ${isLight ? 'light' : ''}${weatherCondition?.toLowerCase()}`}>
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

      {showHistory && history.length === 0 && (
        <p className='no-history'>No search history yet 📜</p>
      )}

      <div
        ref={historyRef}
        className={`history-list ${showHistory ? 'show' : ''}`}
      >
        {history.map((item) => {
          const isActive = 
            isSameCity(item, activeCity);
          
          return (
            <p 
              ref={isActive ? activeRef : null}
              className={`history-item ${isActive ? 'active' : ''}`} 
              key={item} 
              onClick={() => {
                handleSearch(item, true);
            }}
            >
              {item === data?.name && '📍'} {item}
            </p>
          );
        })}
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

      {showFavorites && favorites.length === 0 && (
        <p className='no-favorites'>No favorite cities yet ⭐</p>
      )}

      <div className={`favorites-list ${showFavorites ? 'show' : ''}`}>
        {favorites.map((city) => (
          <p className={`favorites-item ${isSameCity(city, data?.name) ? 'active' : ''}`} 
          key={city} 
          onClick={() => {
            handleSearch(city);
        }}>
          {isSameCity(city, data?.name) && '📍'}
          ⭐ {city}
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;