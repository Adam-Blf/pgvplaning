/**
 * Service de logging pour PGV Planning
 * Format JSON en production, lisible en développement
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  context?: string;
}

const isProduction = process.env.NODE_ENV === 'production';

function formatLog(entry: LogEntry): string {
  if (isProduction) {
    return JSON.stringify(entry);
  }

  const { timestamp, level, message, data, context } = entry;
  const prefix = context ? `[${context}]` : '';
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `${timestamp} [${level.toUpperCase()}] ${prefix} ${message}${dataStr}`;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>,
  context?: string
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data && { data }),
    ...(context && { context }),
  };
}

export const logger = {
  debug(message: string, data?: Record<string, unknown>, context?: string) {
    if (!isProduction) {
      const entry = createLogEntry('debug', message, data, context);
      console.debug(formatLog(entry));
    }
  },

  info(message: string, data?: Record<string, unknown>, context?: string) {
    const entry = createLogEntry('info', message, data, context);
    console.info(formatLog(entry));
  },

  warn(message: string, data?: Record<string, unknown>, context?: string) {
    const entry = createLogEntry('warn', message, data, context);
    console.warn(formatLog(entry));
  },

  error(message: string, data?: Record<string, unknown>, context?: string) {
    const entry = createLogEntry('error', message, data, context);
    console.error(formatLog(entry));
  },

  // Logger avec contexte pré-défini
  withContext(context: string) {
    return {
      debug: (message: string, data?: Record<string, unknown>) =>
        logger.debug(message, data, context),
      info: (message: string, data?: Record<string, unknown>) =>
        logger.info(message, data, context),
      warn: (message: string, data?: Record<string, unknown>) =>
        logger.warn(message, data, context),
      error: (message: string, data?: Record<string, unknown>) =>
        logger.error(message, data, context),
    };
  },
};

export default logger;
