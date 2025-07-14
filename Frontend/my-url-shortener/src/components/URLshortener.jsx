import React, { useState } from 'react';

function URLShortener({ shortenedUrls, setShortenedUrls }) {
  const [urls, setUrls] = useState([{ id: 1, url: '', code: '', validity: 30 }]);
  const [message, setMessage] = useState('');

  const log = (stack, level, pkg, message) => {
    console.log(`[${level.toUpperCase()}] ${stack}/${pkg}: ${message}`);
  };

  const generateCode = () => Math.random().toString(36).substring(2, 8);
  
  const isValidUrl = (url) => {
    try { new URL(url); return true; } catch { return false; }
  };

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
    
    if (validUrls.some(u => !isValidUrl(u.url))) {
      setMessage('❌ Please enter valid URLs');
      return;
    }

    const newUrls = validUrls.map(u => {
      const shortCode = u.code || generateCode();
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
    setMessage(`✅ Created ${newUrls.length} short URL(s)`);
    setUrls([{ id: 1, url: '', code: '', validity: 30 }]);
    log('frontend', 'info', 'handler', `Created ${newUrls.length} URLs`);
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setMessage('📋 Copied to clipboard!');
  };

  const testUrl = (shortCode) => {
    const urlData = shortenedUrls.find(u => u.shortCode === shortCode);
    if (!urlData) return;
    
    if (new Date() > urlData.expiryDate) {
      setMessage('⏰ URL has expired');
      return;
    }

    setShortenedUrls(prev => prev.map(u => 
      u.shortCode === shortCode 
        ? { ...u, clicks: u.clicks + 1, clickHistory: [...u.clickHistory, { timestamp: new Date(), source: 'Test' }] }
        : u
    ));
    
    window.open(urlData.originalUrl, '_blank');
    log('frontend', 'info', 'handler', `Redirected ${shortCode}`);
  };

  return (
    <div className="container">
      <h2>Create Short URLs</h2>
      
      {message && <div className="message">{message}</div>}
      
      {urls.map((url, i) => (
        <div key={url.id} className="url-form">
          <div className="form-header">
            <span>URL #{i + 1}</span>
            {urls.length > 1 && <button onClick={() => removeUrl(url.id)}>❌</button>}
          </div>
          
          <input
            type="text"
            placeholder="https://example.com"
            value={url.url}
            onChange={(e) => updateUrl(url.id, 'url', e.target.value)}
          />
          
          <div className="form-row">
            <input
              type="number"
              placeholder="Minutes (30)"
              value={url.validity}
              onChange={(e) => updateUrl(url.id, 'validity', e.target.value)}
            />
            <input
              type="text"
              placeholder="Custom code (optional)"
              value={url.code}
              onChange={(e) => updateUrl(url.id, 'code', e.target.value)}
            />
          </div>
        </div>
      ))}

      <div className="buttons">
        {urls.length < 5 && <button onClick={addUrl}>+ Add URL</button>}
        <button className="primary" onClick={shortenUrls}>Shorten URLs</button>
      </div>

      {shortenedUrls.slice(-3).map(url => (
        <div key={url.id} className="result">
          <div className="result-url">{url.shortUrl}</div>
          <div className="result-original">{url.originalUrl}</div>
          <div className="result-actions">
            <button onClick={() => copyUrl(url.shortUrl)}>📋</button>
            <button onClick={() => testUrl(url.shortCode)}>🔗</button>
            <span>{url.clicks} clicks</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default URLShortener;