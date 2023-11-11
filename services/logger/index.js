import  winston from 'winston';
import 'winston-daily-rotate-file';

// Create a new Winston logger instance
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        // winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`),
      ),
    }),
  ],
});

export default logger;
// logger.info
