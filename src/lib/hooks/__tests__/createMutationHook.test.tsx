import { renderHook, act } from '@testing-library/react';
import { createMutation } from '../createMutationHook';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

jest.mock('react-hot-toast');

describe('createMutation', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const mockMutationFn = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful mutation', async () => {
    mockMutationFn.mockResolvedValueOnce({ id: 1, name: 'Test' });

    const { result } = renderHook(
      () => createMutation({
        mutationFn: mockMutationFn,
        onSuccess: mockOnSuccess,
        successMessage: 'Success!'
      })(),
      { wrapper }
    );

    await act(async () => {
      await result.current.mutateAsync({ name: 'Test' });
    });

    expect(mockMutationFn).toHaveBeenCalledWith({ name: 'Test' });
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Success!');
  });

  it('should handle mutation errors', async () => {
    const error = new Error('Test error');
    mockMutationFn.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => createMutation({
        mutationFn: mockMutationFn,
        onError: mockOnError,
        errorMessage: 'Error!'
      })(),
      { wrapper }
    );

    await act(async () => {
      try {
        await result.current.mutateAsync({ name: 'Test' });
      } catch {}
    });

    expect(mockOnError).toHaveBeenCalledWith(error);
    expect(toast.error).toHaveBeenCalledWith('Error!');
  });
}); 