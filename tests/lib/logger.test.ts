import winston from 'winston';
import logger from '@/lib/logger';

jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    colorize: jest.fn(),
    printf: jest.fn(),
  },
  transports: {
    File: jest.fn(),
    Console: jest.fn(),
  },
}));

describe('logger', () => {
  it('should create a logger with correct configuration', () => {
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: expect.any(String),
        format: expect.any(Object),
        transports: expect.any(Array),
      })
    );
  });

  it('should have info, error, and warn methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
  });

  it('logs messages with correct methods', () => {
    const testMessage = 'Test message';
    const testMeta = { key: 'value' };

    logger.info(testMessage, testMeta);
    logger.error(testMessage, testMeta);
    logger.warn(testMessage, testMeta);

    const mockLogger = winston.createLogger();
    expect(mockLogger.info).toHaveBeenCalledWith(testMessage, testMeta);
    expect(mockLogger.error).toHaveBeenCalledWith(testMessage, testMeta);
    expect(mockLogger.warn).toHaveBeenCalledWith(testMessage, testMeta);
  });
});
