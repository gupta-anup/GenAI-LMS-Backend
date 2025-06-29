import { registerAs } from '@nestjs/config';
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

const logDirectory = path.join(process.cwd(), 'logs');

export default registerAs('logger', (): WinstonModuleOptions => ({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, context, stack }) => {
      let log = `${timestamp} [${level.toUpperCase()}]`;
      if (context) {
        log += ` [${context}]`;
      }
      log += ` ${message}`;
      if (stack) {
        log += `\n${stack}`;
      }
      return log;
    }),
  ),
  transports: [
    // Console transport for development
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
      format: winston.format.combine(
        winston.format.colorize({
          all: true,
          colors: {
            error: 'red',
            warn: 'yellow',
            info: 'green',
            debug: 'blue',
          },
        }),
        winston.format.printf(({ timestamp, level, message, context, stack }) => {
          let log = `${timestamp} [${level}]`;
          if (context) {
            log += ` [${context}]`;
          }
          log += ` ${message}`;
          if (stack) {
            log += `\n${stack}`;
          }
          return log;
        }),
      ),
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logDirectory, 'application.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.uncolorize(),
        winston.format.json(),
      ),
    }),
    
    // File transport for error logs
    new winston.transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.uncolorize(),
        winston.format.json(),
      ),
    }),
    
    // File transport for debug logs (only in development)
    ...(process.env.NODE_ENV === 'development' ? [
      new winston.transports.File({
        filename: path.join(logDirectory, 'debug.log'),
        level: 'debug',
        maxsize: 5242880, // 5MB
        maxFiles: 3,
        format: winston.format.combine(
          winston.format.uncolorize(),
          winston.format.json(),
        ),
      }),
    ] : []),
  ],
  exitOnError: false,
  handleExceptions: true,
  handleRejections: true,
}));
