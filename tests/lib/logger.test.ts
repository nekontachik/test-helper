import winston from 'winston';
import logger from '../../lib/logger';

jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
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

  it('should have info, error, warn, and debug methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });
});
