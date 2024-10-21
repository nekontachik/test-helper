import { renderHook } from '@testing-library/react';
import { useLogger } from './useLogger';

describe('useLogger', () => {
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

  it('should log info messages', () => {
    const { result } = renderHook(() => useLogger());
    result.current.info('Test info message');
    expect(console.log).toHaveBeenCalledWith('[INFO]', 'Test info message');
  });

  it('should log error messages', () => {
    const { result } = renderHook(() => useLogger());
    result.current.error('Test error message');
    expect(console.error).toHaveBeenCalledWith('[ERROR]', 'Test error message');
  });

  it('should log warning messages', () => {
    const { result } = renderHook(() => useLogger());
    result.current.warn('Test warning message');
    expect(console.warn).toHaveBeenCalledWith('[WARN]', 'Test warning message');
  });

  it('should log debug messages', () => {
    const { result } = renderHook(() => useLogger());
    result.current.debug('Test debug message');
    expect(console.log).toHaveBeenCalledWith('[DEBUG]', 'Test debug message');
  });

  it('should include additional data in log messages', () => {
    const { result } = renderHook(() => useLogger());
    const additionalData = { key: 'value' };
    result.current.info('Test message with data', additionalData);
    expect(console.log).toHaveBeenCalledWith(
      '[INFO]',
      'Test message with data',
      additionalData
    );
  });
});
