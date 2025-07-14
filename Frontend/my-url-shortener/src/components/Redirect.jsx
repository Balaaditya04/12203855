import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import logger from '../utils/logger.js';

function Redirect({ shortenedUrls, setShortenedUrls }) {
  const { shortCode } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const handleRedirect = () => {
      const urlData = shortenedUrls.find(url => url.shortCode === shortCode);
      
      if (!urlData) {
        logger.error('frontend', 'page', `Short URL not found: ${shortCode}`);
        setStatus('error');
        return;
      }

      if (new Date() > urlData.expiryDate) {
        logger.warn('frontend', 'page', `Attempted to access expired URL: ${shortCode}`);
        setStatus('expired');
        return;
      }

      setShortenedUrls(prev => prev.map(url => 
        url.shortCode === shortCode 
          ? { ...url, clicks: url.clicks + 1, clickHistory: [...url.clickHistory, { timestamp: new Date(), source: 'Direct Access' }] }
          : url
      ));

      logger.info('frontend', 'api', `Redirecting ${shortCode} to ${urlData.originalUrl}`);
      setStatus('redirecting');
      
      setTimeout(() => {
        window.location.href = urlData.originalUrl;
      }, 1000);
    };

    setTimeout(handleRedirect, 500);
  }, [shortCode, shortenedUrls, setShortenedUrls]);

  const containerStyle = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', textAlign: 'center', padding: '3rem', background: 'white',
    borderRadius: '8px', margin: '2rem auto', maxWidth: '500px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  if (status === 'loading' || status === 'redirecting') {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem', color: '#2563eb' }}>
          {status === 'loading' ? '🔍' : '↗️'}
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a202c', fontWeight: '600' }}>
          {status === 'loading' ? 'Checking Link...' : 'Redirecting...'}
        </h2>
        <p style={{ fontSize: '1rem', color: '#64748b' }}>
          {status === 'loading' ? 'Verifying your short URL' : 'Taking you to your destination'}
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem', color: '#ef4444' }}>❌</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ef4444', fontWeight: '600' }}>Link Not Found</h2>
        <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '2rem' }}>This short URL doesn't exist or has been deleted.</p>
        <button onClick={() => window.location.href = '/'} style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}>Go Back Home</button>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem', color: '#f59e0b' }}>⏰</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#f59e0b', fontWeight: '600' }}>Link Expired</h2>
        <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '2rem' }}>This short URL has expired and is no longer valid.</p>
        <button onClick={() => window.location.href = '/'} style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}>Create New Link</button>
      </div>
    );
  }

  return null;
}

export default Redirect;