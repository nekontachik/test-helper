import { renderHook } from '@testing-library/react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@chakra-ui/toast';

jest.mock('@chakra-ui/toast', () => ({
  useToast: jest.fn(),
}));

describe('useErrorHandler', () => {
  it('should call toast with error message', () => {
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue(mockToast);

    const { result } = renderHook(() => useErrorHandler());

    result.current.handleError(new Error('Test error message'));

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Test error message',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  });

  it('should handle errors without message', () => {
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue(mockToast);

    const { result } = renderHook(() => useErrorHandler());

    result.current.handleError(new Error());

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'An unknown error occurred',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  });
});
