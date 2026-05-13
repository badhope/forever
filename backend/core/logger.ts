/**
 * Forever - 结构化日志系统
 * 零依赖，支持日志级别控制和结构化输出
 */

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

class Logger {
  private static level: LogLevel = LogLevel.INFO;
  private static handlers: LogHandler[] = [defaultHandler];
  private static moduleLevels: Map<string, LogLevel> = new Map();

  static setLevel(level: LogLevel): void {
    Logger.level = level;
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
        // 防止日志处理器自身抛出异常导致系统崩溃
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
    debug: (msg: string, data?: unknown) => void;
    info: (msg: string, data?: unknown) => void;
    warn: (msg: string, data?: unknown) => void;
    error: (msg: string, data?: unknown) => void;
  } {
    return {
      debug: (msg: string, data?: unknown) => Logger.debug(module, msg, data),
      info: (msg: string, data?: unknown) => Logger.info(module, msg, data),
      warn: (msg: string, data?: unknown) => Logger.warn(module, msg, data),
      error: (msg: string, data?: unknown) => Logger.error(module, msg, data),
    };
  }
}

// 从环境变量初始化日志级别
const envLevel = process.env.FOREVER_LOG_LEVEL?.toUpperCase();
if (envLevel && envLevel in LogLevel) {
  Logger.setLevel(LogLevel[envLevel as keyof typeof LogLevel]);
}

export const logger = Logger;
