import { useState } from 'react';
import { getWeatherUrl } from './config/api';
import './App.css';
import SearchBox from './components/SearchBox';
import WeatherCard from './components/WeatherCard';

function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {data && (<WeatherCard data={data} />)}
    </div>
  );
}

export default App;