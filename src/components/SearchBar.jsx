import { useState } from 'react';

export default function SearchBar({ onSearch, loading }) {
  const [ticker, setTicker] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const symbol = ticker.trim().toUpperCase();
    if (symbol) onSearch(symbol);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter stock ticker (e.g. AAPL)"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !ticker.trim()}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </form>
  );
}
