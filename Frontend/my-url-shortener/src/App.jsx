import React, { useState } from 'react';
import URLShortener from './components/URLshortener';
import Statistics from './components/Statistics';
import './App.css';

export const log = (stack, level, pkg, message) => {
  console.log(`[${level.toUpperCase()}] ${stack}/${pkg}: ${message}`);
};

function App() {
  const [activeTab, setActiveTab] = useState('shorten');
  const [shortenedUrls, setShortenedUrls] = useState([]);

  return (
    <div className="app">
      <header className="header">
        <h1>🔗 URL Shortener</h1>
      </header>

      <nav className="nav">
        <button 
          className={activeTab === 'shorten' ? 'active' : ''}
          onClick={() => setActiveTab('shorten')}
        >
          Shorten URLs
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </nav>

      <main className="main">
        {activeTab === 'shorten' ? (
          <URLShortener 
            shortenedUrls={shortenedUrls}
            setShortenedUrls={setShortenedUrls}
          />
        ) : (
          <Statistics 
            shortenedUrls={shortenedUrls}
            setShortenedUrls={setShortenedUrls}
          />
        )}
      </main>
    </div>
  );
}

export default App;