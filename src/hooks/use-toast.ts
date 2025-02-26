import { useToast as useChakraToast } from '@chakra-ui/react';
import type { UseToastOptions, ToastId } from '@chakra-ui/react';

export interface ToastProps extends UseToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastReturn {
  toast: (props: ToastProps) => ToastId;
}

export function useToast(): ToastReturn {
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
