class Logger {
    constructor(config = {}) {
      this.baseUrl = config.baseUrl || 'http://20.244.56.144/evaluation-service';
      this.token = config.token || null; 
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
  

      console.log(`[${level.toUpperCase()}] ${stack}/${packageName}: ${message}`);

      await this.sendToServer(logData);
    }
  

    async sendToServer(logData, attempt = 1) {
      try {
        const headers = {
          'Content-Type': 'application/json'
        };
  
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

    isValidStack(stack) {
      const validStacks = ['frontend', 'backend'];
      return validStacks.includes(stack.toLowerCase());
    }

    isValidLevel(level) {
      const validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
      return validLevels.includes(level.toLowerCase());
    }

    isValidPackage(stack, packageName) {
      const frontendPackages = ['auth', 'config', 'middleware', 'utils'];
      const backendPackages = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];
      
      const validPackages = stack.toLowerCase() === 'frontend' ? frontendPackages : backendPackages;
      return validPackages.includes(packageName.toLowerCase());
    }
  

    setToken(token) {
      this.token = token;
      console.log('🔐 Authentication token updated');
    }

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
  
  const logger = new Logger();
  

  export { Logger };
  export default logger;