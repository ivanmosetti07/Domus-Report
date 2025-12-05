/**
 * Structured Logger for Domus Report
 * Lightweight logger optimized for Next.js and Vercel deployment
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment: boolean
  private minLevel: LogLevel

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.minLevel = this.isDevelopment ? 'debug' : 'info'
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.minLevel)
    const requestedLevelIndex = levels.indexOf(level)
    return requestedLevelIndex >= currentLevelIndex
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const levelUpper = level.toUpperCase().padEnd(5)

    if (this.isDevelopment) {
      // Formato leggibile per development
      const contextStr = context ? `\n  Context: ${JSON.stringify(context, null, 2)}` : ''
      return `[${timestamp}] ${levelUpper} ${message}${contextStr}`
    } else {
      // Formato JSON per produzione (Vercel logs)
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...context,
      })
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context))
    }
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        ...(error && {
          error: {
            message: error.message || String(error),
            stack: error.stack,
            name: error.name,
          },
        }),
      }
      console.error(this.formatMessage('error', message, errorContext))
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export helper for creating scoped loggers
export function createLogger(scope: string) {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(`[${scope}] ${message}`, context),
    info: (message: string, context?: LogContext) =>
      logger.info(`[${scope}] ${message}`, context),
    warn: (message: string, context?: LogContext) =>
      logger.warn(`[${scope}] ${message}`, context),
    error: (message: string, error?: Error | any, context?: LogContext) =>
      logger.error(`[${scope}] ${message}`, error, context),
  }
}
