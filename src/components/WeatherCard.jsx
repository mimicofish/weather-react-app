function WeatherCard({ data }) {
    return (
        <div>
            <h2>{data.name}</h2>
            <p>{data.main.temp} ⁰C</p>
            <p>{data?.weather?.[0]?.description}</p>
        </div>
    );
}

export default WeatherCard;