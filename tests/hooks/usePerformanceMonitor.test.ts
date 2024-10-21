import { renderHook } from '@testing-library/react';
import { usePerformanceMonitor } from './usePerformanceMonitor';

describe('usePerformanceMonitor', () => {
  const originalConsoleLog = console.log;
  const originalPerformanceNow = performance.now;

  beforeEach(() => {
    jest.useFakeTimers();
    console.log = jest.fn();
    performance.now = jest.fn().mockReturnValue(0);
  });

  afterEach(() => {
    jest.useRealTimers();
    console.log = originalConsoleLog;
    performance.now = originalPerformanceNow;
  });

  it('should log performance data on mount', () => {
    renderHook(() => usePerformanceMonitor('TestComponent'));
    jest.advanceTimersByTime(100);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('TestComponent render time: 100ms')
    );
  });

  it('should log performance data on unmount', () => {
    const { unmount } = renderHook(() =>
      usePerformanceMonitor('TestComponent')
    );
    jest.advanceTimersByTime(200);
    unmount();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('TestComponent total lifecycle time: 200ms')
    );
  });

  it('should handle multiple renders', () => {
    const { rerender } = renderHook(() =>
      usePerformanceMonitor('TestComponent')
    );
    jest.advanceTimersByTime(100);
    rerender();
    jest.advanceTimersByTime(100);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('TestComponent render time: 100ms')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('TestComponent re-render time: 100ms')
    );
  });
});
