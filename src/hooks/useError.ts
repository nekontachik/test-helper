import { useToast } from '@chakra-ui/react';
import { getErrorMessage } from '@/lib/errors/errorMessages';
import { logger } from '@/lib/utils/logger';

export function useError(): {
  handleError: (error: Error, context?: string) => void;
} {
  const toast = useToast();

  const handleError = (error: Error, context?: string): void => {
    const errorDetails = getErrorMessage(error);

    // Log the error
    logger.error(context || 'Error occurred', {
      error: error.message,
      stack: error.stack,
      context
    });

    // Show user-friendly toast
    toast({
      title: errorDetails.title,
      description: errorDetails.description,
      status: errorDetails.severity,
      duration: 5000,
      isClosable: true,
      position: 'top-right'
    });
  };

  return { handleError };
} 