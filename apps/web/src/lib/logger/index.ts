/**
 * Comprehensive Logging System
 * Integrates with Sentry for error tracking and provides structured logging
 */

import * as Sentry from '@sentry/nextjs';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  timestamp: string;
}

class Logger {
  private serviceName: string;
  private environment: string;

  constructor(serviceName: string = 'ai-shu') {
    this.serviceName = serviceName;
    this.environment = process.env.NODE_ENV || 'development';
  }

  /**
   * Create a structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      context: {
        ...context,
        service: this.serviceName,
        environment: this.environment,
      },
      error,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format and output log entry
   */
  private output(entry: LogEntry): void {
    const { level, message, context, error, timestamp } = entry;

    // In production, use JSON format for log aggregation
    if (this.environment === 'production') {
      console.log(
        JSON.stringify({
          timestamp,
          level,
          message,
          ...context,
          error: error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : undefined,
        })
      );
    } else {
      // In development, use readable format
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      const contextStr = context ? ` ${JSON.stringify(context)}` : '';

      if (error) {
        console[level === LogLevel.ERROR || level === LogLevel.FATAL ? 'error' : 'log'](
          `${prefix} ${message}${contextStr}`,
          error
        );
      } else {
        console[level === LogLevel.ERROR || level === LogLevel.FATAL ? 'error' : 'log'](
          `${prefix} ${message}${contextStr}`
        );
      }
    }
  }

  /**
   * Send error to Sentry
   */
  private sendToSentry(message: string, context?: LogContext, error?: Error): void {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return;
    }

    Sentry.withScope((scope) => {
      // Add context
      if (context) {
        Object.keys(context).forEach((key) => {
          scope.setExtra(key, context[key]);
        });

        // Set user context
        if (context.userId) {
          scope.setUser({ id: context.userId });
        }

        // Set tags
        if (context.route) {
          scope.setTag('route', context.route);
        }
        if (context.method) {
          scope.setTag('method', context.method);
        }
      }

      // Capture exception or message
      if (error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(message, 'error');
      }
    });
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.output(entry);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.output(entry);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.output(entry);
  }

  /**
   * Error level logging
   */
  error(message: string, context?: LogContext, error?: Error): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    this.output(entry);

    // Send to Sentry in production
    if (this.environment === 'production') {
      this.sendToSentry(message, context, error);
    }
  }

  /**
   * Fatal level logging (critical errors that require immediate attention)
   */
  fatal(message: string, context?: LogContext, error?: Error): void {
    const entry = this.createLogEntry(LogLevel.FATAL, message, context, error);
    this.output(entry);

    // Always send fatal errors to Sentry
    this.sendToSentry(message, context, error);
  }

  /**
   * Log API request
   */
  apiRequest(
    method: string,
    route: string,
    context?: Omit<LogContext, 'method' | 'route'>
  ): void {
    this.info(`API Request: ${method} ${route}`, {
      ...context,
      method,
      route,
    });
  }

  /**
   * Log API response
   */
  apiResponse(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
    context?: Omit<LogContext, 'method' | 'route' | 'statusCode' | 'duration'>
  ): void {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;

    const entry = this.createLogEntry(
      level,
      `API Response: ${method} ${route} - ${statusCode} (${duration}ms)`,
      {
        ...context,
        method,
        route,
        statusCode,
        duration,
      }
    );

    this.output(entry);
  }

  /**
   * Log database operation
   */
  database(operation: string, table: string, context?: LogContext): void {
    this.debug(`Database: ${operation} on ${table}`, {
      ...context,
      operation,
      table,
    });
  }

  /**
   * Log authentication event
   */
  auth(event: string, userId?: string, context?: LogContext): void {
    this.info(`Auth: ${event}`, {
      ...context,
      userId,
      event,
    });
  }

  /**
   * Log payment event
   */
  payment(event: string, amount?: number, context?: LogContext): void {
    this.info(`Payment: ${event}`, {
      ...context,
      event,
      amount,
    });
  }
}

// Export singleton instance
export const logger = new Logger('ai-shu');

// Export for testing or custom instances
export { Logger };
