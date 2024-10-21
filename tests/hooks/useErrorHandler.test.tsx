import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from './useErrorHandler';

describe('useErrorHandler', () => {
  it('should handle errors', () => {
    const { result } = renderHook(() => useErrorHandler());

    act(() => {
      result.current.handleError(new Error('Test error'));
    });

    expect(result.current.error).toEqual(new Error('Test error'));
  });
});
