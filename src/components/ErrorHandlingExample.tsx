import React from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { Box, Button, Text } from '@chakra-ui/react';

export const ErrorHandlingExample: React.FC = (): JSX.Element => {
  const { handleError } = useErrorHandler();

  const simulateError = (): void => {
    try {
      throw new Error('Simulated error');
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Unknown error'));
    }
  };

  return (
    <Box>
      <Button onClick={simulateError}>Simulate Error</Button>
      <Text mt={4}>
        Click the button to simulate an error and see how it&apos;s handled.
      </Text>
    </Box>
  );
};
