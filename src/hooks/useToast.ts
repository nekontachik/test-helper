import { useToast as useChakraToast } from '@chakra-ui/toast';

export function useToast() {
  const toast = useChakraToast();

  const showSuccessToast = (message: string) => {
    toast({
      title: 'Success',
      description: message,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const showErrorToast = (message: string) => {
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  return { showSuccessToast, showErrorToast };
}
