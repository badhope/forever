/**
 * Forever - 结构化日志系统
 * 内部委托给 pino 实现，支持日志级别控制和结构化输出
 */

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

/**
 * 将 LogLevel 枚举值映射为 pino 的日志级别字符串
 */
function toPinoLevel(level: LogLevel): 'debug' | 'info' | 'warn' | 'error' | 'silent' {
  switch (level) {
    case LogLevel.DEBUG: return 'debug';
    case LogLevel.INFO: return 'info';
    case LogLevel.WARN: return 'warn';
    case LogLevel.ERROR: return 'error';
    case LogLevel.SILENT: return 'silent';
  }
}

/**
 * 将 pino 的数字级别映射回 LogLevel 枚举值
 */
function fromPinoLevel(level: number): LogLevel {
  if (level <= pino.levels.values.debug) return LogLevel.DEBUG;
  if (level <= pino.levels.values.info) return LogLevel.INFO;
  if (level <= pino.levels.values.warn) return LogLevel.WARN;
  if (level <= pino.levels.values.error) return LogLevel.ERROR;
  return LogLevel.SILENT;
}

/**
 * 将 pino 的数字级别映射为级别名称字符串
 */
function pinoLevelName(level: number): string {
  if (level <= pino.levels.values.debug) return 'DEBUG';
  if (level <= pino.levels.values.info) return 'INFO';
  if (level <= pino.levels.values.warn) return 'WARN';
  if (level <= pino.levels.values.error) return 'ERROR';
  return 'SILENT';
}

/**
 * 创建 pino 实例，根据环境选择 transport
 */
function createPinoInstance(): pino.Logger {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // 生产环境：默认 JSON 输出
    return pino({
      level: 'info',
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  // 开发环境：使用 pino-pretty transport 实现彩色终端输出
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

    // 同时输出到 pino（内部日志记录）
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

    // 构造 LogEntry 分发给自定义 handler
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
    // 创建一个绑定了 module 的 pino child logger
    const childLogger = Logger.pinoInstance.child({ module });

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
