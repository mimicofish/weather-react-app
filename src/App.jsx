import { useEffect, useState } from 'react';
import { getWeatherUrl } from './config/api';
import './App.css';
import SearchBox from './components/SearchBox';
import WeatherCard from './components/WeatherCard';

function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  return ( 
    <div className='app'>
      <h1>Weather App 🌦️</h1>

      <SearchBox
        city={city}
        setCity={setCity}
        onSearch={handleSearch}
      />

      {loading && <p>Loading... ⏳</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {history.length > 0 && <p>Search History:</p>}
      {history.slice(0, 5).map((item, index) => (
        <p key={index} onClick={() => {
          setCity(item);
          handleSearch();
        }}>{item}</p>
      ))}

      {data && (<WeatherCard data={data} />)}
    </div>
  );
}

export default App;