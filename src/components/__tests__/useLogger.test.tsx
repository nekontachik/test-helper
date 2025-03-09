import { renderHook } from '@testing-library/react';
import * as loggerModule from '@/lib/logger';
import { useLogger } from '@/hooks/useLogger';

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  }
}));

describe('useLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log info messages with component name', () => {
    const { result } = renderHook(() => useLogger('TestComponent'));
    
    result.current.logInfo('Test message');
    
    expect(loggerModule.logger.info).toHaveBeenCalledWith('[TestComponent] Test message');
  });

  it('should log error messages with component name', () => {
    const { result } = renderHook(() => useLogger('TestComponent'));
    const testError = new Error('Test error');
    
    result.current.logError('Error occurred', testError);
    
    expect(loggerModule.logger.error).toHaveBeenCalledWith('[TestComponent] Error occurred', { error: testError });
  });
}); 