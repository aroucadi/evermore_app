import { randomUUID } from 'crypto';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  traceId?: string;
  userId?: string;
  [key: string]: any;
}

export class Logger {
  private static instance: Logger;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, meta: Record<string, any> = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };

    // In a real app, we would send this to Datadog/Splunk/etc.
    // For MVP, we print JSON to stdout so standard collectors can pick it up.
    console.log(JSON.stringify(entry));
  }

  public info(message: string, meta?: Record<string, any>) {
    this.log('info', message, meta);
  }

  public warn(message: string, meta?: Record<string, any>) {
    this.log('warn', message, meta);
  }

  public error(message: string, meta?: Record<string, any>) {
    this.log('error', message, meta);
  }

  public debug(message: string, meta?: Record<string, any>) {
    this.log('debug', message, meta);
  }
}

export const logger = Logger.getInstance();
