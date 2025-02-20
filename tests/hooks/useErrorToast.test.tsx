import { renderHook, act } from '@testing-library/react';
import { useErrorToast } from '@/hooks/useErrorToast';
import { ChakraProvider, useToast } from '@chakra-ui/react';

describe('useErrorToast', () => {
  it('should call toast with error status', () => {
    const mockToast = jest.fn();
    (useToast as jest.Mock).mockReturnValue(mockToast);

    const { result } = renderHook(() => useErrorToast(), {
      wrapper: ChakraProvider,
    });

    act(() => {
      result.current('Error Title', 'Error Description');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error Title',
      description: 'Error Description',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  });
});
