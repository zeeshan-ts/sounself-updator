import winston from 'winston';
import path from 'path';
import { getDataDirectory } from './functions';
import 'winston-daily-rotate-file';

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(getDataDirectory(), 'Logs/%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14d',
    }),
  ],
});
