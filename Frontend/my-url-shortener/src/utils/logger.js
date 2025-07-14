class Logger {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://20.244.56.144/evaluation-service';
    this.token = config.token || null; // Bearer token from registration
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  /**
   * Main logging function
   * @param {string} stack - "frontend" or "backend"
   * @param {string} level - "debug", "info", "warn", "error", "fatal"
   * @param {string} packageName - Valid package name based on stack
   * @param {string} message - Log message
   */
  async log(stack, level, packageName, message) {
    // Validate inputs
    if (!this.isValidStack(stack)) {
      console.error(`Invalid stack: ${stack}. Must be "frontend" or "backend"`);
      return;
    }

    if (!this.isValidLevel(level)) {
      console.error(`Invalid level: ${level}. Must be one of: debug, info, warn, error, fatal`);
      return;
    }

    if (!this.isValidPackage(stack, packageName)) {
      console.error(`Invalid package "${packageName}" for stack "${stack}"`);
      return;
    }

    const logData = {
      stack: stack.toLowerCase(),
      level: level.toLowerCase(),
      package: packageName.toLowerCase(),
      message: message
    };

    // Always log to console first
    console.log(`[${level.toUpperCase()}] ${stack}/${packageName}: ${message}`);

    // Attempt to send to server
    await this.sendToServer(logData);
  }

  /**
   * Send log data to the test server
   */
  async sendToServer(logData, attempt = 1) {
    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      // Add authorization header if token is available
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseUrl}/logs`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(logData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Log sent successfully. ID: ${result.logID}`);
        return result;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Logging failed (attempt ${attempt}/${this.retryAttempts}):`, error.message);
      
      // Retry logic
      if (attempt < this.retryAttempts) {
        console.log(`🔄 Retrying in ${this.retryDelay}ms...`);
        setTimeout(() => {
          this.sendToServer(logData, attempt + 1);
        }, this.retryDelay);
      } else {
        console.error(`💥 Failed to send log after ${this.retryAttempts} attempts`);
      }
    }
  }

  /**
   * Validate stack parameter
   */
  isValidStack(stack) {
    const validStacks = ['frontend', 'backend'];
    return validStacks.includes(stack.toLowerCase());
  }

  /**
   * Validate level parameter
   */
  isValidLevel(level) {
    const validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
    return validLevels.includes(level.toLowerCase());
  }

  /**
   * Validate package parameter based on stack
   */
  isValidPackage(stack, packageName) {
    // Frontend packages
    const frontendPackages = ['api', 'component', 'hook', 'page', 'state', 'style'];
    
    // Backend packages  
    const backendPackages = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];
    
    // Packages that can be used in both
    const sharedPackages = ['auth', 'config', 'middleware', 'utils'];
    
    const validPackages = stack.toLowerCase() === 'frontend' 
      ? [...frontendPackages, ...sharedPackages]
      : [...backendPackages, ...sharedPackages];
      
    return validPackages.includes(packageName.toLowerCase());
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    console.log('🔐 Authentication token updated');
  }

  /**
   * Convenience methods for different log levels
   */
  debug(stack, packageName, message) {
    return this.log(stack, 'debug', packageName, message);
  }

  info(stack, packageName, message) {
    return this.log(stack, 'info', packageName, message);
  }

  warn(stack, packageName, message) {
    return this.log(stack, 'warn', packageName, message);
  }

  error(stack, packageName, message) {
    return this.log(stack, 'error', packageName, message);
  }

  fatal(stack, packageName, message) {
    return this.log(stack, 'fatal', packageName, message);
  }
}

// Create and export singleton instance
const logger = new Logger();

// Export both the class and instance
export { Logger };
export default logger;