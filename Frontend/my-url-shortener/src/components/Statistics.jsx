import React, { useEffect } from 'react';
import logger from '../utils/logger.js';

function Statistics({ shortenedUrls, setShortenedUrls }) {
  useEffect(() => {
    logger.info('frontend', 'config', 'Statistics component initialized');
    logger.debug('frontend', 'utils', `Displaying statistics for ${shortenedUrls.length} URLs`);
  }, [shortenedUrls.length]);
  
  const activeUrls = shortenedUrls.filter(u => new Date() < u.expiryDate);
  const expiredUrls = shortenedUrls.filter(u => new Date() >= u.expiryDate);
  const totalClicks = shortenedUrls.reduce((sum, u) => sum + u.clicks, 0);

  const deleteUrl = (id) => {
    const urlToDelete = shortenedUrls.find(u => u.id === id);
    if (urlToDelete) {
      logger.info('frontend', 'utils', `Deleting URL: ${urlToDelete.shortCode} (${urlToDelete.originalUrl})`);
      setShortenedUrls(prev => prev.filter(u => u.id !== id));
      logger.info('frontend', 'utils', `URL deleted successfully, remaining URLs: ${shortenedUrls.length - 1}`);
    } else {
      logger.error('frontend', 'utils', `Failed to delete URL with ID: ${id} - URL not found`);
    }
  };

  const clearAllUrls = () => {
    setShortenedUrls([]);
    localStorage.removeItem('shortenedUrls');
    logger.info('frontend', 'utils', 'All URLs cleared from storage');
  };

  const handleUrlClick = (url) => {
    logger.info('frontend', 'middleware', `User viewing details for URL: ${url.shortCode}`);
    // This could be expanded to show a detailed modal
  };

  if (shortenedUrls.length === 0) {
    logger.info('frontend', 'utils', 'No URLs to display in statistics');
    return (
      <div className="container">
        <h2>Your Links</h2>
        <p className="friendly-subtitle">All your shortened links will appear here</p>
        <div className="empty">
          No links created yet.
          <br />
          <small>Go to "Create Links" to make your first one!</small>
        </div>
      </div>
    );
  }

  // Log current statistics
  logger.debug('frontend', 'utils', `Statistics summary - Total: ${shortenedUrls.length}, Active: ${activeUrls.length}, Expired: ${expiredUrls.length}, Total Clicks: ${totalClicks}`);

  return (
    <div className="container">
      <h2>Your Links</h2>
      <p className="friendly-subtitle">
        View and manage all your shortened links
      </p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{shortenedUrls.length}</div>
          <div className="stat-label">Total Links</div>
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

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={clearAllUrls}
          className="clear-button"
        >
          Clear All Links
        </button>
        <div className="debug-info">
          {shortenedUrls.length} links stored | localStorage: {localStorage.getItem('shortenedUrls') ? 'Yes' : 'No'}
        </div>
      </div>

      <div className="url-list">
        <div className="url-list-header">
          All Links
        </div>
        {shortenedUrls.map(url => {
          const isExpired = new Date() >= url.expiryDate;
          const statusText = isExpired ? 'Expired' : 'Active';
          
          return (
            <div key={url.id} className="url-item">
              <div className="url-main" onClick={() => handleUrlClick(url)}>
                <div className="url-short">{url.shortUrl}</div>
                <div className="url-original">Original: {url.originalUrl}</div>
                <div className="url-meta">
                  Created: {url.createdAt.toLocaleDateString()} | 
                  Expires: {url.expiryDate.toLocaleDateString()} | 
                  Status: {statusText}
                </div>
              </div>
              <div className="url-actions">
                <span className="clicks">{url.clicks} clicks</span>
                <button 
                  onClick={() => deleteUrl(url.id)}
                  title="Delete this link"
                >
                  Delete
                </button>
              </div>
              {url.clickHistory.length > 0 && (
                <div className="click-history">
                  <strong>Recent clicks:</strong> {url.clickHistory.slice(-3).map((click, i) => (
                    <span key={i}>
                      {click.timestamp.toLocaleTimeString()} ({click.source})
                      {i < Math.min(url.clickHistory.length, 3) - 1 ? ', ' : ''}
                    </span>
                  ))}
                  {url.clickHistory.length > 3 && (
                    <span> and {url.clickHistory.length - 3} more...</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Statistics;