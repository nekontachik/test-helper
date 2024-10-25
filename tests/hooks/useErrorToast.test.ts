import { renderHook } from '@testing-library/react';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useToast } from '@/hooks/use-toast'; // Changed to use shadcn/ui toast

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('useErrorToast', () => {
  const mockToast = jest.fn();

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  it('should call toast with error message', () => {
    const { result } = renderHook(() => useErrorToast());

    result.current('Test error message');

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Test error message',
      variant: 'destructive',
      duration: 5000,
    });
  });

  it('should handle errors without message', () => {
    const { result } = renderHook(() => useErrorToast());

    result.current();

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'An unknown error occurred',
      variant: 'destructive',
      duration: 5000,
    });
  });
});
