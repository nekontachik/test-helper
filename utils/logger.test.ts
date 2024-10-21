import logger from './logger';

// Mock console methods
const originalConsole = { ...console };
beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
});

afterEach(() => {
  console = { ...originalConsole };
});

describe('logger', () => {
  it('should log messages', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    logger.info('Test message');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Test message')
    );

    consoleSpy.mockRestore();
  });

  it('should log info messages', () => {
    logger.info('Test info message');
    expect(console.log).toHaveBeenCalledWith('[INFO]', 'Test info message');
  });

  it('should log error messages', () => {
    logger.error('Test error message');
    expect(console.error).toHaveBeenCalledWith('[ERROR]', 'Test error message');
  });

  it('should log warning messages', () => {
    logger.warn('Test warning message');
    expect(console.warn).toHaveBeenCalledWith('[WARN]', 'Test warning message');
  });

  it('should log debug messages', () => {
    logger.debug('Test debug message');
    expect(console.log).toHaveBeenCalledWith('[DEBUG]', 'Test debug message');
  });

  it('should include additional data in log messages', () => {
    const additionalData = { key: 'value' };
    logger.info('Test message with data', additionalData);
    expect(console.log).toHaveBeenCalledWith(
      '[INFO]',
      'Test message with data',
      additionalData
    );
  });
});
