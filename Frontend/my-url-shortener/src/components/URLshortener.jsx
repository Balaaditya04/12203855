import React, { useState, useEffect } from 'react';
import logger from '../utils/logger.js';

function URLShortener({ shortenedUrls, setShortenedUrls }) {
  const [urls, setUrls] = useState([{ id: 1, url: '', code: '', validity: 30 }]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    logger.info('frontend', 'config', 'URLShortener component initialized');
  }, []);

  const generateCode = () => Math.random().toString(36).substring(2, 8);
  
  const isValidUrl = (url) => {
    try { 
      new URL(url); 
      logger.debug('frontend', 'utils', `URL validation passed: ${url}`);
      return true; 
    } catch { 
      logger.warn('frontend', 'utils', `URL validation failed: ${url}`);
      return false; 
    }
  };

  const addUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, { id: Date.now(), url: '', code: '', validity: 30 }]);
      logger.info('frontend', 'utils', `Added new URL field, total: ${urls.length + 1}`);
    } else {
      logger.warn('frontend', 'utils', 'Maximum URL limit (5) reached');
    }
  };

  const removeUrl = (id) => {
    if (urls.length > 1) {
      setUrls(urls.filter(u => u.id !== id));
      logger.info('frontend', 'utils', `Removed URL field ${id}, remaining: ${urls.length - 1}`);
    }
  };

  const updateUrl = (id, field, value) => {
    setUrls(urls.map(u => u.id === id ? { ...u, [field]: value } : u));
    logger.debug('frontend', 'utils', `Updated URL field ${field} for ID ${id}`);
  };

  const shortenUrls = async () => {
    logger.info('frontend', 'middleware', 'Starting URL shortening process');
    setMessage('');
    
    const validUrls = urls.filter(u => u.url.trim());
    
    if (validUrls.length === 0) {
      logger.warn('frontend', 'middleware', 'No URLs provided for shortening');
      setMessage('Please enter at least one URL to get started.');
      return;
    }
    
    if (validUrls.some(u => !isValidUrl(u.url))) {
      logger.error('frontend', 'middleware', 'Invalid URLs detected in batch');
      setMessage('Please make sure all URLs start with http:// or https://');
      return;
    }

    // Check for duplicate custom codes
    const customCodes = validUrls.filter(u => u.code).map(u => u.code);
    const duplicateCodes = customCodes.filter((code, index) => customCodes.indexOf(code) !== index);
    
    if (duplicateCodes.length > 0) {
      logger.error('frontend', 'middleware', `Duplicate custom codes detected: ${duplicateCodes.join(', ')}`);
      setMessage(`Duplicate custom codes: ${duplicateCodes.join(', ')}. Each code must be unique.`);
      return;
    }

    try {
      const newUrls = validUrls.map(u => {
        const shortCode = u.code || generateCode();
        
        // Check if code already exists
        const exists = shortenedUrls.some(existing => existing.shortCode === shortCode);
        if (exists) {
          throw new Error(`The code "${shortCode}" is already taken. Please try a different one.`);
        }

        logger.info('frontend', 'middleware', `Generated short code: ${shortCode} for ${u.url}`);
        
        return {
          id: Date.now() + Math.random(),
          originalUrl: u.url,
          shortCode: shortCode,
          shortUrl: `http://localhost:3000/${shortCode}`,
          createdAt: new Date(),
          expiryDate: new Date(Date.now() + (u.validity || 30) * 60000),
          clicks: 0,
          clickHistory: []
        };
      });

      setShortenedUrls(prev => [...prev, ...newUrls]);
      setMessage(`Successfully created ${newUrls.length} short link${newUrls.length > 1 ? 's' : ''}!`);
      setUrls([{ id: 1, url: '', code: '', validity: 30 }]);
      
      logger.info('frontend', 'middleware', `Successfully created ${newUrls.length} short URLs`);
      
    } catch (error) {
      logger.error('frontend', 'middleware', `URL shortening failed: ${error.message}`);
      setMessage(error.message);
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Copied to clipboard!');
      logger.info('frontend', 'utils', `Copied URL to clipboard: ${url}`);
    } catch (error) {
      logger.error('frontend', 'utils', `Failed to copy to clipboard: ${error.message}`);
      setMessage('Failed to copy to clipboard. Please copy manually.');
    }
  };

  const testUrl = (shortCode) => {
    logger.info('frontend', 'middleware', `Testing short URL: ${shortCode}`);
    
    const urlData = shortenedUrls.find(u => u.shortCode === shortCode);
    if (!urlData) {
      logger.error('frontend', 'middleware', `Short URL not found: ${shortCode}`);
      setMessage('Short URL not found.');
      return;
    }
    
    if (new Date() > urlData.expiryDate) {
      logger.warn('frontend', 'middleware', `Attempted to access expired URL: ${shortCode}`);
      setMessage('This link has expired.');
      return;
    }

    // Record click with geolocation simulation
    const clickData = {
      timestamp: new Date(),
      source: 'Test Button',
      location: 'Test Environment'
    };

    setShortenedUrls(prev => prev.map(u => 
      u.shortCode === shortCode 
        ? { 
            ...u, 
            clicks: u.clicks + 1, 
            clickHistory: [...u.clickHistory, clickData]
          }
        : u
    ));
    
    logger.info('frontend', 'middleware', `Redirecting ${shortCode} to ${urlData.originalUrl}, total clicks: ${urlData.clicks + 1}`);
    window.open(urlData.originalUrl, '_blank');
  };

  return (
    <div className="container">
      <h2>Create Short Links</h2>
      <p className="friendly-subtitle">
        Enter your long URLs below and we'll create short, shareable links for you.
      </p>
      
      {message && <div className="message">{message}</div>}
      
      {urls.map((url, i) => (
        <div key={url.id} className="url-form">
          <div className="form-header">
            <span>Link {i + 1}</span>
            {urls.length > 1 && (
              <button onClick={() => removeUrl(url.id)}>
                Remove
              </button>
            )}
          </div>
          
          <input
            type="text"
            placeholder="Enter your long URL here (e.g., https://example.com/very-long-url)"
            value={url.url}
            onChange={(e) => updateUrl(url.id, 'url', e.target.value)}
          />
          
          <div className="form-row">
            <input
              type="number"
              placeholder="Expires in (minutes)"
              value={url.validity}
              onChange={(e) => updateUrl(url.id, 'validity', e.target.value)}
            />
            <input
              type="text"
              placeholder="Custom short code (optional)"
              value={url.code}
              onChange={(e) => updateUrl(url.id, 'code', e.target.value)}
            />
          </div>
        </div>
      ))}

      <div className="buttons">
        {urls.length < 5 && (
          <button onClick={addUrl}>
            Add Another Link ({urls.length}/5)
          </button>
        )}
        <button className="primary" onClick={shortenUrls}>
          Create Short Links
        </button>
      </div>

      {shortenedUrls.slice(-3).map(url => (
        <div key={url.id} className="result">
          <div className="result-url">{url.shortUrl}</div>
          <div className="result-original">Original: {url.originalUrl}</div>
          <div className="result-actions">
            <button onClick={() => copyUrl(url.shortUrl)}>
              Copy
            </button>
            <button onClick={() => testUrl(url.shortCode)}>
              Test
            </button>
            <span>{url.clicks} clicks</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default URLShortener;