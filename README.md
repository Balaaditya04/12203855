# URL Shortener App

A simple React-based URL shortener application that allows users to create short URLs with custom expiration times and track analytics.

## Features

- ✅ Shorten up to 5 URLs simultaneously
- ✅ Custom short codes (optional)
- ✅ Validity periods (default: 30 minutes)
- ✅ Click tracking and analytics
- ✅ Client-side validation
- ✅ Copy to clipboard functionality
- ✅ URL expiration handling
- ✅ Statistics dashboard

## Setup Instructions

1. **Create the project:**
   ```bash
   npx create-vite@latest my-url-shortener --template react
   cd my-url-shortener
   ```

2. **Replace the generated files with the provided code:**
   - Copy all the files from the artifacts into your project
   - Create folders: `mkdir src/components src/utils`

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:3000`

6. **Set up logging (optional):**
   - Copy `.env.example` to `.env`
   - Add your authentication token from the test server registration
   - Restart the development server

## 🔑 **Getting Authentication Token:**

To enable full logging functionality:

1. **Register with test server:**
   ```bash
   curl -X POST http://20.244.56.144/evaluation-service/register \
   -H "Content-Type: application/json" \
   -d '{
     "email": "your-email@domain.com",
     "name": "Your Name", 
     "mobileNo": "1234567890",
     "githubUsername": "your-github-username",
     "rollNo": "your-roll-number",
     "accessCode": "your-access-code"
   }'
   ```

2. **Copy the token from response:**
   ```json
   {
     "access_token": "your-bearer-token-here"
   }
   ```

3. **Add to .env file:**
   ```
   REACT_APP_AUTH_TOKEN=your-bearer-token-here
   ```

## File Structure

```
src/
├── main.jsx                 # Entry point
├── App.jsx                  # Main app component  
├── App.css                  # Styling
├── components/
│   ├── URLShortener.jsx     # URL creation component
│   └── Statistics.jsx       # Analytics component
└── utils/
    ├── logger.js            # 🚀 Logging Middleware (Reusable Package)
    └── logging-demo.js      # Demo usage examples
```

## Usage

1. **Shorten URLs**: Enter up to 5 URLs with optional custom codes and validity periods
2. **View Statistics**: Check analytics for all created URLs
3. **Test Links**: Click the test button to verify URL redirection
4. **Copy URLs**: Use the copy button to copy short URLs to clipboard

## Technical Requirements Met

- ✅ React application
- ✅ Runs on localhost:3000
- ✅ No external UI libraries (vanilla CSS)
- ✅ Logging middleware integration
- ✅ Client-side routing and redirection
- ✅ Error handling and validation
- ✅ URL uniqueness management
- ✅ Click analytics and tracking

## 📝 Logging Middleware

The app includes a **comprehensive logging middleware** that meets all evaluation requirements:

### ✅ **Features:**
- **API Integration**: Makes real HTTP calls to `http://20.244.56.144/evaluation-service/logs`
- **Bearer Authentication**: Supports token-based authentication
- **Retry Logic**: Automatically retries failed requests (3 attempts by default)
- **Input Validation**: Validates stack, level, and package parameters
- **Error Handling**: Graceful fallback to console logging
- **Reusable Package**: Can be imported and used across projects

### 🔧 **Usage Examples:**

```javascript
import logger from './utils/logger.js';

// Basic usage
await logger.log('frontend', 'info', 'utils', 'User clicked button');

// Convenience methods
await logger.info('frontend', 'config', 'App initialized');
await logger.warn('frontend', 'middleware', 'Validation failed');
await logger.error('frontend', 'auth', 'Login failed');

// Set authentication token
logger.setToken('your-bearer-token-here');
```

### 📊 **Valid Parameters:**

**Stack**: `frontend`, `backend`

**Level**: `debug`, `info`, `warn`, `error`, `fatal`

**Frontend Packages**: `auth`, `config`, `middleware`, `utils`

**Backend Packages**: `cache`, `controller`, `cron_job`, `db`, `domain`, `handler`, `repository`, `route`, `service`

### 🎯 **Integration Points:**
- ✅ App initialization and configuration
- ✅ URL validation and processing  
- ✅ User interactions and navigation
- ✅ Error handling and warnings
- ✅ Performance monitoring
- ✅ Click tracking and analytics

### 🧪 **Testing the Logging:**
1. Open browser console (F12)
2. Use the app (create URLs, navigate tabs)
3. See logs in console with format: `[LEVEL] stack/package: message`
4. Check network tab for API calls to logging service
