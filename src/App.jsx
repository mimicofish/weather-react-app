import { useState } from 'react';
import { getWeatherUrl } from './config/api';

function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

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
    <div>
      <h1>Weather App</h1>
      <input 
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Search your city here'
      />
      <button onClick={handleSearch}>Search</button>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {data && (
        <div>
          <h2>{data.name}</h2>
          <p>{data.main.temp} ⁰C</p>
          <p>{data?.weather?.[0]?.description}</p>
        </div>
      )}
    </div>
  );
}

export default App;