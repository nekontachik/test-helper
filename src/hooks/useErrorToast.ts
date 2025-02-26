import { useToast } from '@chakra-ui/toast';

export const useErrorToast = (): (title: string, description?: string) => void => {
  const toast = useToast();

  const showErrorToast = (title: string, description?: string): void => {
    toast({
      title,
      description,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  return showErrorToast;
};
