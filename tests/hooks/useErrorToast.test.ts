import { renderHook } from '@testing-library/react';
import { useErrorToast } from './useErrorToast';
import { useToast } from '@chakra-ui/react';

jest.mock('@chakra-ui/react', () => ({
  useToast: jest.fn(),
}));

describe('useErrorToast', () => {
  const mockToast = jest.fn();

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  it('should call toast with error message', () => {
    const { result } = renderHook(() => useErrorToast());

    result.current('Test error message');

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Test error message',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  });

  it('should handle errors without message', () => {
    const { result } = renderHook(() => useErrorToast());

    result.current();

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'An unknown error occurred',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  });
});
