import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  // ... rest of the configuration
});

// Remove the unused timestamp variable

export default logger;
