import { renderHook } from '@testing-library/react';
import { useLogger } from '../../src/hooks/useLogger';
import * as loggerModule from '../../src/lib/utils/logger';

jest.mock('../../src/lib/utils/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

describe('useLogger', () => {
  it('should return logging functions', () => {
    const { result } = renderHook(() => useLogger('TestComponent'));

    result.current.logInfo('Test info');
    result.current.logError('Test error');

    expect(loggerModule.logInfo).toHaveBeenCalledWith(
      'TestComponent',
      'Test info'
    );
    expect(loggerModule.logError).toHaveBeenCalledWith(
      'TestComponent',
      'Test error'
    );
  });
});
