import { useToast as useChakraToast } from '@chakra-ui/react';
import type { UseToastOptions } from '@chakra-ui/react';

export interface ToastProps extends UseToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = useChakraToast();

  return {
    toast: (props: ToastProps) => {
      const { variant = 'default', ...rest } = props;
      
      return toast({
        position: 'top-right',
        duration: 5000,
        isClosable: true,
        status: variant === 'destructive' ? 'error' : 'success',
        ...rest,
      });
    },
  };
}
