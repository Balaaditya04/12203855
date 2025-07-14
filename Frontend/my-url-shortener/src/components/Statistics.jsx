import React from 'react';

function Statistics({ shortenedUrls, setShortenedUrls }) {
  const log = (stack, level, pkg, message) => {
    console.log(`[${level.toUpperCase()}] ${stack}/${pkg}: ${message}`);
  };
  
  const activeUrls = shortenedUrls.filter(u => new Date() < u.expiryDate);
  const expiredUrls = shortenedUrls.filter(u => new Date() >= u.expiryDate);
  const totalClicks = shortenedUrls.reduce((sum, u) => sum + u.clicks, 0);

  const deleteUrl = (id) => {
    setShortenedUrls(prev => prev.filter(u => u.id !== id));
    log('frontend', 'info', 'handler', 'URL deleted');
  };

  if (shortenedUrls.length === 0) {
    return (
      <div className="container">
        <h2>📊 Statistics</h2>
        <div className="empty">No URLs created yet</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>📊 Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{shortenedUrls.length}</div>
          <div className="stat-label">Total URLs</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{activeUrls.length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{expiredUrls.length}</div>
          <div className="stat-label">Expired</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{totalClicks}</div>
          <div className="stat-label">Total Clicks</div>
        </div>
      </div>

      <div className="url-list">
        {shortenedUrls.map(url => (
          <div key={url.id} className="url-item">
            <div className="url-main">
              <div className="url-short">{url.shortUrl}</div>
              <div className="url-original">{url.originalUrl}</div>
              <div className="url-meta">
                Created: {url.createdAt.toLocaleDateString()} | 
                Expires: {url.expiryDate.toLocaleDateString()} |
                Status: {new Date() < url.expiryDate ? '✅ Active' : '❌ Expired'}
              </div>
            </div>
            <div className="url-actions">
              <span className="clicks">{url.clicks} clicks</span>
              <button onClick={() => deleteUrl(url.id)}>🗑️</button>
            </div>
            {url.clickHistory.length > 0 && (
              <div className="click-history">
                Recent clicks: {url.clickHistory.slice(-3).map((click, i) => (
                  <span key={i}>{click.timestamp.toLocaleTimeString()}</span>
                )).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Statistics;