import { renderHook, act } from '@testing-library/react';
import { useApi } from '@/hooks/useApi';
import axios, { AxiosResponse } from 'axios';

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
    const mockApiFunction = jest.fn<Promise<AxiosResponse>, []>(() => 
      Promise.resolve({ 
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      })
    );
    
    const { result } = renderHook(() => useApi(mockApiFunction));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle successful GET request', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockApiFunction = jest.fn<Promise<AxiosResponse>, []>(() => 
      Promise.resolve({ 
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      })
    );

    const { result } = renderHook(() => useApi(mockApiFunction));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle network error', async () => {
    const mockApiFunction = jest.fn<Promise<AxiosResponse>, []>(() => 
      Promise.reject(new Error('Network error'))
    );

    const { result } = renderHook(() => useApi(mockApiFunction));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set loading state during request', async () => {
    const mockApiFunction = jest.fn<Promise<AxiosResponse>, []>(() => 
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            data: { id: 1 },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as any,
          });
        }, 100);
      })
    );

    const { result } = renderHook(() => useApi(mockApiFunction));

    act(() => {
      result.current.execute();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    expect(result.current.isLoading).toBe(false);
  });
});
