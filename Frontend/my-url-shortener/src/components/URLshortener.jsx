import React, { useState } from 'react';
import logger from '../utils/logger.js';

function URLShortener({ shortenedUrls, setShortenedUrls }) {
  const [urls, setUrls] = useState([{ id: 1, url: '', code: '', validity: 30 }]);
  const [message, setMessage] = useState('');

  const generateCode = () => Math.random().toString(36).substring(2, 8);
  const isValidUrl = (url) => { try { new URL(url); return true; } catch { return false; } };

  const addUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, { id: Date.now(), url: '', code: '', validity: 30 }]);
    }
  };

  const removeUrl = (id) => {
    if (urls.length > 1) setUrls(urls.filter(u => u.id !== id));
  };

  const updateUrl = (id, field, value) => {
    setUrls(urls.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const shortenUrls = () => {
    setMessage('');
    const validUrls = urls.filter(u => u.url.trim());
    
    if (validUrls.length === 0) {
      setMessage('Please enter at least one URL');
      return;
    }
    
    if (validUrls.some(u => !isValidUrl(u.url))) {
      setMessage('Please enter valid URLs (include http:// or https://)');
      return;
    }

    const customCodes = validUrls.filter(u => u.code).map(u => u.code);
    const duplicates = customCodes.filter((code, index) => customCodes.indexOf(code) !== index);
    
    if (duplicates.length > 0) {
      setMessage(`Duplicate codes: ${duplicates.join(', ')}`);
      return;
    }

    try {
      const newUrls = validUrls.map(u => {
        const shortCode = u.code || generateCode();
        
        if (shortenedUrls.some(existing => existing.shortCode === shortCode)) {
          throw new Error(`Code "${shortCode}" already exists`);
        }

        return {
          id: Date.now() + Math.random(),
          originalUrl: u.url,
          shortCode,
          shortUrl: `http://localhost:3000/${shortCode}`,
          createdAt: new Date(),
          expiryDate: new Date(Date.now() + (u.validity || 30) * 60000),
          clicks: 0,
          clickHistory: []
        };
      });

      setShortenedUrls(prev => [...prev, ...newUrls]);
      setMessage(`Created ${newUrls.length} short link${newUrls.length > 1 ? 's' : ''}!`);
      setUrls([{ id: 1, url: '', code: '', validity: 30 }]);
      logger.info('frontend', 'api', `Created ${newUrls.length} URLs`);
      
    } catch (error) {
      setMessage(error.message);
      logger.error('frontend', 'api', `URL creation failed: ${error.message}`);
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Copied to clipboard!');
    } catch (error) {
      setMessage('Failed to copy');
    }
  };

  const testUrl = (shortCode) => {
    const urlData = shortenedUrls.find(u => u.shortCode === shortCode);
    if (!urlData) {
      setMessage('URL not found');
      return;
    }
    
    if (new Date() > urlData.expiryDate) {
      setMessage('URL expired');
      return;
    }

    setShortenedUrls(prev => prev.map(u => 
      u.shortCode === shortCode 
        ? { ...u, clicks: u.clicks + 1, clickHistory: [...u.clickHistory, { timestamp: new Date(), source: 'Test' }] }
        : u
    ));
    
    window.open(urlData.originalUrl, '_blank');
  };

  return (
    <div className="container">
      <h2>Create Short Links</h2>
      <p className="friendly-subtitle">Enter your long URLs below and we'll create short, shareable links for you.</p>
      
      {message && <div className="message">{message}</div>}
      
      {urls.map((url, i) => (
        <div key={url.id} className="url-form">
          <div className="form-header">
            <span>Link {i + 1}</span>
            {urls.length > 1 && <button onClick={() => removeUrl(url.id)}>Remove</button>}
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
        {urls.length < 5 && <button onClick={addUrl}>Add Another Link ({urls.length}/5)</button>}
        <button className="primary" onClick={shortenUrls}>Create Short Links</button>
      </div>

      {shortenedUrls.slice(-3).map(url => (
        <div key={url.id} className="result">
          <div className="result-url">{url.shortUrl}</div>
          <div className="result-original">Original: {url.originalUrl}</div>
          <div className="result-actions">
            <button onClick={() => copyUrl(url.shortUrl)}>Copy</button>
            <button onClick={() => testUrl(url.shortCode)}>Test</button>
            <span>{url.clicks} clicks</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default URLShortener;