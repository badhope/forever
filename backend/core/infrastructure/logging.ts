import envConfig from '../config/env';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const sensitivePatterns = [
  /api[_-]?key/i,
  /password/i,
  /secret/i,
  /token/i,
  /auth/i,
  /credential/i,
  /private[_-]?key/i,
  /access[_-]?token/i,
];

function redactSecrets(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactSecrets);
  
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = sensitivePatterns.some(pattern => pattern.test(key));
    result[key] = isSensitive ? '[REDACTED]' : redactSecrets(value);
  }
  return result;
}

function getLogLevelNumber(level: LogLevel): number {
  const levels: Record<LogLevel, number> = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5,
  };
  return levels[level] ?? 2;
}

export class SubsystemLogger {
  private subsystem: string;
  private minLevel: number;

  constructor(subsystem: string) {
    this.subsystem = subsystem;
    this.minLevel = getLogLevelNumber(envConfig.LOG_LEVEL as LogLevel);
  }

  private shouldLog(level: number): boolean {
    return level >= this.minLevel;
  }

  private log(level: LogLevel, ...args: any[]): void {
    const levelNum = getLogLevelNumber(level);
    if (!this.shouldLog(levelNum)) return;

    const logData = {
      timestamp: new Date().toISOString(),
      level,
      subsystem: this.subsystem,
      args: redactSecrets(args),
    };
    console.log(JSON.stringify(logData));
  }

  trace(...args: any[]): void { this.log('trace', ...args); }
  debug(...args: any[]): void { this.log('debug', ...args); }
  info(...args: any[]): void { this.log('info', ...args); }
  warn(...args: any[]): void { this.log('warn', ...args); }
  error(...args: any[]): void { this.log('error', ...args); }
  fatal(...args: any[]): void { this.log('fatal', ...args); }
}

export class LogManager {
  private static instance: LogManager;
  private loggers: Map<string, SubsystemLogger> = new Map();

  private constructor() {}

  static getInstance(): LogManager {
    if (!LogManager.instance) {
      LogManager.instance = new LogManager();
    }
    return LogManager.instance;
  }

  getLogger(subsystem: string): SubsystemLogger {
    if (!this.loggers.has(subsystem)) {
      this.loggers.set(subsystem, new SubsystemLogger(subsystem));
    }
    return this.loggers.get(subsystem)!;
  }
}

export const logManager = LogManager.getInstance();

export function getLogger(subsystem: string): SubsystemLogger {
  return logManager.getLogger(subsystem);
}
