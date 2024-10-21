import winston from 'winston';
import path from 'path';

function logError(error) {
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const logFile = path.join(logDir, 'error.log');
  const timestamp = new Date().toISOString();
  const errorMessage = `${timestamp}: ${error.stack}\n\n`;

  fs.appendFileSync(logFile, errorMessage);
}

module.exports = logError;
