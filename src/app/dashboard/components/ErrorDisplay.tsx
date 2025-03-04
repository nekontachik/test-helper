'use client';

import { Box, Alert, AlertIcon, AlertTitle, AlertDescription, Text } from '@chakra-ui/react';
import type { DashboardError } from '../types';
import { createErrorMessage } from '@/lib/errors/errorMessages';

interface ErrorDisplayProps {
  error: DashboardError;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps): JSX.Element => {
  const errorDetails = createErrorMessage(error.code, error.message);
  
  return (
    <Box p={8}>
      <Alert status="error" variant="solid" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>{errorDetails.title}</AlertTitle>
          <AlertDescription>
            {errorDetails.description}
            {errorDetails.action && (
              <Text mt={2} fontSize="sm">
                Suggested action: {errorDetails.action}
              </Text>
            )}
          </AlertDescription>
        </Box>
      </Alert>
    </Box>
  );
};

export default ErrorDisplay; 