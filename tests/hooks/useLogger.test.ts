import { renderHook } from '@testing-library/react';
import { useLogger } from '@/hooks/useLogger';
import winston from 'winston';

// Create mock logger methods
const mockLoggerMethods = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Mock winston
jest.mock('winston', () => ({
  createLogger: jest.fn(() => mockLoggerMethods),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    simple: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
  },
}));

describe('useLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    ['info', 'Test info message'],
    ['error', 'Test error message'],
    ['warn', 'Test warning message'],
    ['debug', 'Test debug message'],
  ])('should log %s messages', (level, message) => {
    const { result } = renderHook(() => useLogger());
    result.current[level as keyof typeof mockLoggerMethods](message);
    expect(mockLoggerMethods[level as keyof typeof mockLoggerMethods]).toHaveBeenCalledWith(message);
  });

  it('should include metadata in log messages', () => {
    const { result } = renderHook(() => useLogger());
    const message = 'Test message with metadata';
    const metadata = { key: 'value' };
    
    result.current.info(message, metadata);
    expect(mockLoggerMethods.info).toHaveBeenCalledWith(message, metadata);
  });

  it('should handle error objects', () => {
    const { result } = renderHook(() => useLogger());
    const message = 'Error occurred';
    const error = new Error('Test error');
    
    result.current.error(message, error);
    expect(mockLoggerMethods.error).toHaveBeenCalledWith(message, error);
  });
});
