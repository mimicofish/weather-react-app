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

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  },[history]);

  useEffect(() => {
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  async function handleSearch() {
    console.log(city);

    if (city.trim() === '') return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(getWeatherUrl(city));

      const result = await response.json();

      if (result.cod !== 200) {
        setError(result.message);
        setData(null);
        return;
      }

      setHistory(prev => {
        const filtered = prev.filter(item => item !== city);
        return [city, ...filtered].slice(0, 5);
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

  return ( 
    <div className={`app ${isLight ? 'light' : ''}`}>
      <h1 className='title'>Weather App 🌦️</h1>

      <button className='toggle-theme' onClick={() => setIsLight(prev => !prev)}>
        {isLight ? '🌙 Dark' : '☀️ Light'}
      </button>

      <SearchBox
        city={city}
        setCity={setCity}
        onSearch={handleSearch}
        onGetLocationWeather={getLocationWeather}
      />

      {loading && <p>Loading... ⏳</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {history.length > 0 && <p className='history-title'>Search History:</p>}
      {history.slice(0, 5).map((item, index) => (
        <p className='history-item' key={index} onClick={() => {
          setCity(item);
          handleSearch();
        }}>{item}</p>
      ))}
      {data && (<WeatherCard data={data} />)}      
    </div>
  );
}

export default App;