import { useToast } from '@chakra-ui/toast';

export const useErrorHandler = () => {
  const toast = useToast();

  const handleError = (error: Error, context?: string) => {
    const errorMessage = error.message || 'An unknown error occurred';
    const description = context ? `${context}: ${errorMessage}` : errorMessage;

    toast({
      title: 'Error',
      description,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  return { handleError };
};
