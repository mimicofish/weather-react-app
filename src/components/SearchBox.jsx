function SearchBox({ city, setCity, onSearch}) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <div className="search">
            <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search your city here"
            />
            <button onClick={onSearch}>Search</button>
        </div>
    );
}

export default SearchBox;