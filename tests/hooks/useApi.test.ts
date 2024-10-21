import { renderHook, act } from '@testing-library/react';
import { useApi } from './useApi';

describe('useApi', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as jest.Mock;
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useApi());
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle successful GET request', async () => {
    const mockData = { id: 1, name: 'Test' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useApi());

    await act(async () => {
      await result.current.get('/api/test');
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useApi());

    await act(async () => {
      await result.current.get('/api/test');
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
  });
});
