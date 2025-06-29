import { Injectable, LoggerService as NestLoggerService, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  /**
   * Write a 'log' level log.
   */
  log(message: any, context?: string): void {
    this.logger.info(message, { context });
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, trace?: string, context?: string): void {
    this.logger.error(message, { context, stack: trace });
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, context?: string): void {
    this.logger.warn(message, { context });
  }

  /**
   * Write a 'debug' level log.
   */
  debug(message: any, context?: string): void {
    this.logger.debug(message, { context });
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose(message: any, context?: string): void {
    this.logger.verbose(message, { context });
  }

  /**
   * Write an 'info' level log.
   */
  info(message: any, context?: string): void {
    this.logger.info(message, { context });
  }

  /**
   * Write a 'http' level log for HTTP requests.
   */
  http(message: any, context?: string): void {
    this.logger.http(message, { context });
  }

  /**
   * Write a 'silly' level log.
   */
  silly(message: any, context?: string): void {
    this.logger.silly(message, { context });
  }

  /**
   * Get the underlying Winston logger instance.
   */
  getWinstonLogger(): Logger {
    return this.logger;
  }

  /**
   * Create a child logger with additional context.
   */
  child(context: string): LoggerService {
    const childLogger = this.logger.child({ context });
    return new LoggerService(childLogger);
  }

  /**
   * Log an HTTP request.
   */
  logRequest(req: any, res: any, responseTime?: number): void {
    const { method, url, ip, headers } = req;
    const { statusCode } = res;
    const userAgent = headers['user-agent'] || '';
    
    const message = `${method} ${url} ${statusCode} - ${responseTime}ms - ${ip} - ${userAgent}`;
    
    if (statusCode >= 400) {
      this.error(message, undefined, 'HTTP');
    } else {
      this.http(message, 'HTTP');
    }
  }

  /**
   * Log a database query.
   */
  logQuery(query: string, parameters?: any[], duration?: number): void {
    const message = `Query: ${query}`;
    const meta = {
      parameters: parameters || [],
      duration: duration || 0,
    };
    
    if (duration && duration > 1000) {
      this.warn(`Slow query detected: ${message}`, 'DATABASE');
    } else {
      this.debug(`${message} | Duration: ${duration}ms`, 'DATABASE');
    }
  }

  /**
   * Log business logic events.
   */
  logBusiness(event: string, data?: any, context?: string): void {
    const message = `Business Event: ${event}`;
    this.info(message, context || 'BUSINESS');
    
    if (data) {
      this.debug(`Event Data: ${JSON.stringify(data)}`, context || 'BUSINESS');
    }
  }

  /**
   * Log security events.
   */
  logSecurity(event: string, details?: any, severity: 'info' | 'warn' | 'error' = 'info'): void {
    const message = `Security Event: ${event}`;
    const securityContext = 'SECURITY';
    
    switch (severity) {
      case 'error':
        this.error(message, JSON.stringify(details), securityContext);
        break;
      case 'warn':
        this.warn(message, securityContext);
        break;
      default:
        this.info(message, securityContext);
    }
  }

  /**
   * Log performance metrics.
   */
  logPerformance(operation: string, duration: number, threshold: number = 1000): void {
    const message = `Performance: ${operation} took ${duration}ms`;
    
    if (duration > threshold) {
      this.warn(message, 'PERFORMANCE');
    } else {
      this.debug(message, 'PERFORMANCE');
    }
  }
}
