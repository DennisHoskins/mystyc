export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  service?: string;
  userId?: string;
  requestId?: string;
}

class Logger {
  // private isDev = process.env.NODE_ENV === 'development';
  private isDev = true;
  private logLevel = this.getLogLevel();
  
  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    switch (level) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      default: return this.isDev ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  private sanitizeContext(context: LogContext): LogContext {
    // Comprehensive sensitive data patterns
    const sensitiveKeys = [
      // Authentication & Authorization
      'password', 'passwd', 'pwd',
      'token', 'access_token', 'refresh_token', 'id_token',
      'authorization', 'auth', 'bearer',
      'jwt', 'session', 'session_id', 'sessionid',
      'api_key', 'apikey', 'api-key',
      'secret', 'client_secret', 'app_secret',
      
      // Firebase & OAuth
      'private_key', 'private-key', 'privatekey',
      'client_id', 'client-id', 'clientid',
      'firebase_private_key', 'firebase_client_email',
      
      // Database & Infrastructure  
      'connection_string', 'database_url', 'db_url',
      'redis_url', 'mongo_uri', 'mongodb_uri',
      
      // Personal Information
      'ssn', 'social_security', 'tax_id',
      'credit_card', 'card_number', 'cvv', 'cvc',
      'phone', 'mobile', 'telephone',
      
      // Security & Encryption
      'key', 'encryption_key', 'signing_key',
      'certificate', 'cert', 'pem',
      'hash', 'signature', 'nonce',
      
      // Application Specific
      'webhook_secret', 'stripe_key', 'paypal_secret',
      'aws_secret', 'gcp_key', 'azure_key'
    ];
    
    const sanitized = { ...context };
    
    Object.keys(sanitized).forEach(key => {

      const val = sanitized[key];
      if (val instanceof Error) {
        sanitized[key] = val.message;
        return;
      }

      const lowerKey = key.toLowerCase();
      
      // Check if key contains any sensitive pattern
      const isSensitive = sensitiveKeys.some(sensitive => 
        lowerKey.includes(sensitive.toLowerCase())
      );
      
      if (isSensitive) {
        if (typeof sanitized[key] === 'string') {
          // Show only first 4 characters for debugging, rest redacted
          const value = sanitized[key] as string;
          if (value.length > 8) {
            sanitized[key] = `${value.substring(0, 4)}***[REDACTED]`;
          } else {
            sanitized[key] = '[REDACTED]';
          }
        } else {
          sanitized[key] = '[REDACTED]';
        }
      }
      
      // Additional check for values that look like tokens/keys
      if (typeof sanitized[key] === 'string') {
        const value = sanitized[key] as string;
        
        // JWT pattern detection
        if (value.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)) {
          sanitized[key] = `${value.substring(0, 10)}***[JWT_REDACTED]`;
        }
        
        // API key pattern detection (long alphanumeric strings)
        else if (value.match(/^[A-Za-z0-9]{20,}$/) && value.length > 20) {
          sanitized[key] = `${value.substring(0, 8)}***[KEY_REDACTED]`;
        }
        
        // UUID pattern that might be sensitive
        else if (value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) && 
                 (lowerKey.includes('key') || lowerKey.includes('secret') || lowerKey.includes('token'))) {
          sanitized[key] = `${value.substring(0, 8)}***[UUID_REDACTED]`;
        }
      }
      
      // Truncate very long strings that passed sanitization
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = sanitized[key].substring(0, 1000) + '... [TRUNCATED]';
      }
    });
    
    return sanitized;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext, service?: string): string {
    try {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: LogLevel[level],
        message,
        ...(context && { context: this.sanitizeContext(context) }),
        ...(service && { service }),
      };

      if (this.isDev) {
        // Pretty print for development
        const levelColors = {
          [LogLevel.ERROR]: '\x1b[31m', // Red
          [LogLevel.WARN]: '\x1b[33m',  // Yellow
          [LogLevel.INFO]: '\x1b[36m',  // Cyan
          [LogLevel.DEBUG]: '\x1b[37m', // White
        };
        const reset = '\x1b[0m';
        const color = levelColors[level] || reset;
        
        let output = `${color}[${entry.level}]${reset} ${entry.timestamp} ${message}`;
        if (service) output += ` [${service}]`;
        if (context) output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
        
        return output;
      } else {
        // JSON format for production
        return JSON.stringify(entry);
      }
    } catch (error) {
      // CRITICAL: Never call logger methods here - use console directly to avoid infinite recursion
      console.error('[LOGGER ERROR] Failed to format message:', error);
      return `[LOGGER ERROR] ${message}`;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  error(message: string, context?: LogContext, service?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, context, service));
    }
  }

  warn(message: string, context?: LogContext, service?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context, service));
    }
  }

  info(message: string, context?: LogContext, service?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, context, service));
    }
  }

  debug(message: string, context?: LogContext, service?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.info(this.formatMessage(LogLevel.DEBUG, message, context, service));
    }
  }

  // Special methods for common use cases
  security(message: string, context?: LogContext): void {
    // Security events are always logged regardless of level
    const securityEntry = this.formatMessage(LogLevel.ERROR, `[SECURITY] ${message}`, context, 'SECURITY');
    console.error(securityEntry);
  }

  api(method: string, endpoint: string, context?: LogContext): void {
    this.info(`API ${method} ${endpoint}`, context, 'API');
  }

  auth(message: string, context?: LogContext): void {
    this.info(message, context, 'AUTH');
  }

  db(message: string, context?: LogContext): void {
    this.debug(message, context, 'DATABASE');
  }

  // Create service-specific loggers - DEPRECATED
  // Use main logger with service parameter instead: logger.info(msg, context, 'ServiceName')
  createServiceLogger(serviceName: string) {
    return {
      error: (message: string, context?: LogContext) => this.error(message, context, serviceName),
      warn: (message: string, context?: LogContext) => this.warn(message, context, serviceName),
      info: (message: string, context?: LogContext) => this.info(message, context, serviceName),
      debug: (message: string, context?: LogContext) => this.debug(message, context, serviceName),
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export service logger factory - DEPRECATED 
// Use: logger.info(message, context, 'ServiceName') instead
export const createServiceLogger = (serviceName: string) => logger.createServiceLogger(serviceName);