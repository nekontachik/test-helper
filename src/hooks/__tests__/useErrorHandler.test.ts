import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '../useErrorHandler';
import { TestRunError } from '@/lib/errors/specific/testErrors';

const mockToast = jest.fn();
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockToast })
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle errors and show toast', () => {
    const { result } = renderHook(() => useErrorHandler());
    const testError = new TestRunError('Test failed');

    act(() => {
      result.current.handleError(testError);
    });

    expect(result.current.error).toEqual({
      message: 'Test failed',
      code: 'TEST_RUN_ERROR',
      details: undefined,
      status: 500
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'TEST_RUN_ERROR',
      description: 'Test failed',
      variant: 'destructive'
    });
  });

  it('should retry operations when specified', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValueOnce('success');

    const response = await act(async () => 
      result.current.withErrorHandling(operation, { 
        retryCount: 2,
        retryDelay: 100 
      })
    );

    expect(operation).toHaveBeenCalledTimes(3);
    expect(response).toBe('success');
  });

  it('should clear error state', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.handleError(new TestRunError('Test error'));
    });
    expect(result.current.error).toBeTruthy();
    
    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });
}); 