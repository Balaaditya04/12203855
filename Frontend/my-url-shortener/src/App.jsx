import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import URLShortener from './components/URLshortener.jsx';
import Statistics from './components/Statistics';
import Redirect from './components/Redirect';
import logger from './utils/logger.js';
import './App.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('shorten');
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    logger.info('frontend', 'page', 'App started');
    
    const savedUrls = localStorage.getItem('shortenedUrls');
    if (savedUrls) {
      const parsedUrls = JSON.parse(savedUrls).map(url => ({
        ...url,
        createdAt: new Date(url.createdAt),
        expiryDate: new Date(url.expiryDate),
        clickHistory: url.clickHistory.map(click => ({...click, timestamp: new Date(click.timestamp)}))
      }));
      setShortenedUrls(parsedUrls);
    }
  }, []);

  useEffect(() => {
    if (shortenedUrls.length > 0) {
      localStorage.setItem('shortenedUrls', JSON.stringify(shortenedUrls));
    }
  }, [shortenedUrls]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate('/');
  };

  if (location.pathname !== '/' && location.pathname.length > 1) {
    return (
      <Routes>
        <Route path="/:shortCode" element={<Redirect shortenedUrls={shortenedUrls} setShortenedUrls={setShortenedUrls} />} />
      </Routes>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>QuickLink</h1>
        <p className="header-subtitle">Simple URL shortener for your long links</p>
      </header>

      <nav className="nav">
        <button className={activeTab === 'shorten' ? 'active' : ''} onClick={() => handleTabChange('shorten')}>
          Create Links
        </button>
        <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => handleTabChange('stats')}>
          View Links
        </button>
      </nav>

      <main className="main">
        {activeTab === 'shorten' ? (
          <URLShortener shortenedUrls={shortenedUrls} setShortenedUrls={setShortenedUrls} />
        ) : (
          <Statistics shortenedUrls={shortenedUrls} setShortenedUrls={setShortenedUrls} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;