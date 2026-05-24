import pino from 'pino';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  module: string;
  message: string;
  data?: unknown;
}

type LogHandler = (entry: LogEntry) => void;

function defaultHandler(entry: LogEntry): void {
  const colors: Record<string, string> = {
    DEBUG: '\x1b[36m',
    INFO: '\x1b[32m',
    WARN: '\x1b[33m',
    ERROR: '\x1b[31m',
  };
  const color = colors[entry.level] || '';
  const reset = '\x1b[0m';
  const time = entry.timestamp.slice(11, 19);
  const prefix = `${color}[${entry.level}]${reset} ${time} [${entry.module}]`;

  if (entry.data !== undefined) {
    console.log(`${prefix} ${entry.message}`, entry.data);
  } else {
    console.log(`${prefix} ${entry.message}`);
  }
}

function toPinoLevel(level: LogLevel): 'debug' | 'info' | 'warn' | 'error' | 'silent' {
  switch (level) {
    case LogLevel.DEBUG: return 'debug';
    case LogLevel.INFO: return 'info';
    case LogLevel.WARN: return 'warn';
    case LogLevel.ERROR: return 'error';
    case LogLevel.SILENT: return 'silent';
  }
}

function createPinoInstance(): pino.Logger {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return pino({
      level: 'info',
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  return pino({
    level: 'debug',
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat: '[{module}] {msg}',
      },
    },
  });
}

class Logger {
  private static level: LogLevel = LogLevel.INFO;
  private static handlers: LogHandler[] = [defaultHandler];
  private static moduleLevels: Map<string, LogLevel> = new Map();
  private static pinoInstance: pino.Logger = createPinoInstance();

  static setLevel(level: LogLevel): void {
    Logger.level = level;
    Logger.pinoInstance.level = toPinoLevel(level);
  }

  static setModuleLevel(module: string, level: LogLevel): void {
    Logger.moduleLevels.set(module, level);
  }

  static addHandler(handler: LogHandler): void {
    Logger.handlers.push(handler);
  }

  static removeHandler(handler: LogHandler): void {
    const index = Logger.handlers.indexOf(handler);
    if (index !== -1) {
      Logger.handlers.splice(index, 1);
    }
  }

  private static shouldLog(level: LogLevel, module: string): boolean {
    const moduleLevel = Logger.moduleLevels.get(module);
    const effectiveLevel = moduleLevel !== undefined ? moduleLevel : Logger.level;
    return level >= effectiveLevel;
  }

  private static log(level: LogLevel, levelName: string, module: string, message: string, data?: unknown): void {
    if (!Logger.shouldLog(level, module)) {
      return;
    }

    const pinoLogger = Logger.pinoInstance.child({ module });
    switch (level) {
      case LogLevel.DEBUG:
        pinoLogger.debug(data !== undefined ? { data } : {}, message);
        break;
      case LogLevel.INFO:
        pinoLogger.info(data !== undefined ? { data } : {}, message);
        break;
      case LogLevel.WARN:
        pinoLogger.warn(data !== undefined ? { data } : {}, message);
        break;
      case LogLevel.ERROR:
        pinoLogger.error(data !== undefined ? { data } : {}, message);
        break;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: levelName,
      module,
      message,
      data,
    };

    for (const handler of Logger.handlers) {
      try {
        handler(entry);
      } catch {
      }
    }
  }

  static debug(module: string, message: string, data?: unknown): void {
    Logger.log(LogLevel.DEBUG, 'DEBUG', module, message, data);
  }

  static info(module: string, message: string, data?: unknown): void {
    Logger.log(LogLevel.INFO, 'INFO', module, message, data);
  }

  static warn(module: string, message: string, data?: unknown): void {
    Logger.log(LogLevel.WARN, 'WARN', module, message, data);
  }

  static error(module: string, message: string, data?: unknown): void {
    Logger.log(LogLevel.ERROR, 'ERROR', module, message, data);
  }

  static createModule(module: string): {
    debug: (msg: string, ...args: unknown[]) => void;
    info: (msg: string, ...args: unknown[]) => void;
    warn: (msg: string, ...args: unknown[]) => void;
    error: (msg: string, ...args: unknown[]) => void;
  } {
    return {
      debug: (msg: string, ...args: unknown[]) => Logger.debug(module, msg, args.length > 0 ? args : undefined),
      info: (msg: string, ...args: unknown[]) => Logger.info(module, msg, args.length > 0 ? args : undefined),
      warn: (msg: string, ...args: unknown[]) => Logger.warn(module, msg, args.length > 0 ? args : undefined),
      error: (msg: string, ...args: unknown[]) => Logger.error(module, msg, args.length > 0 ? args : undefined),
    };
  }
}

const envLevel = process.env.FOREVER_LOG_LEVEL?.toUpperCase();
if (envLevel && envLevel in LogLevel) {
  Logger.setLevel(LogLevel[envLevel as keyof typeof LogLevel]);
}

export const logger = Logger;