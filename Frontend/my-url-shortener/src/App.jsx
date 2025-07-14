import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import URLShortener from './components/URLshortener.jsx';
import Statistics from './components/Statistics';
import Redirect from './components/Redirect';
import logger from './utils/logger.js';
import './App.css';

// Main app content component
function AppContent() {
  const [activeTab, setActiveTab] = useState('shorten');
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Load URLs from localStorage on app start
  useEffect(() => {
    // Initialize the application
    logger.info('frontend', 'page', 'URL Shortener application started successfully');
    logger.debug('frontend', 'config', 'Application running on http://localhost:3000');
    
    // Load saved URLs from localStorage
    try {
      const savedUrls = localStorage.getItem('shortenedUrls');
      if (savedUrls) {
        const parsedUrls = JSON.parse(savedUrls);
        // Convert date strings back to Date objects
        const urlsWithDates = parsedUrls.map(url => ({
          ...url,
          createdAt: new Date(url.createdAt),
          expiryDate: new Date(url.expiryDate),
          clickHistory: url.clickHistory.map(click => ({
            ...click,
            timestamp: new Date(click.timestamp)
          }))
        }));
        setShortenedUrls(urlsWithDates);
        logger.info('frontend', 'state', `Loaded ${urlsWithDates.length} URLs from localStorage`);
      }
    } catch (error) {
      logger.error('frontend', 'state', `Failed to load URLs from localStorage: ${error.message}`);
    }
    
    // Set authentication token if available (from registration process)
    const token = import.meta.env.VITE_AUTH_TOKEN || null;
    if (token) {
      logger.setToken(token);
      logger.info('frontend', 'auth', 'Authentication token configured');
    } else {
      logger.warn('frontend', 'auth', 'No authentication token found - logs will be sent without authentication');
    }
  }, []);

  // Save URLs to localStorage whenever they change
  useEffect(() => {
    if (shortenedUrls.length > 0) {
      try {
        localStorage.setItem('shortenedUrls', JSON.stringify(shortenedUrls));
        logger.debug('frontend', 'state', `Saved ${shortenedUrls.length} URLs to localStorage`);
      } catch (error) {
        logger.error('frontend', 'state', `Failed to save URLs to localStorage: ${error.message}`);
      }
    }
  }, [shortenedUrls]);

  const handleTabChange = (tab) => {
    logger.info('frontend', 'component', `User switched to ${tab} tab`);
    setActiveTab(tab);
    navigate('/');
  };

  // Check if we're on a short URL path
  const isShortUrl = location.pathname !== '/' && location.pathname.length > 1;

  if (isShortUrl) {
    return (
      <Routes>
        <Route 
          path="/:shortCode" 
          element={
            <Redirect 
              shortenedUrls={shortenedUrls}
              setShortenedUrls={setShortenedUrls}
            />
          } 
        />
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
        <button 
          className={activeTab === 'shorten' ? 'active' : ''}
          onClick={() => handleTabChange('shorten')}
        >
          Create Links
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => handleTabChange('stats')}
        >
          View Links
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

// Main App component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;