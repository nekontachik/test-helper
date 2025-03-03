'use client';

import { ErrorBoundary } from 'react-error-boundary';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps): JSX.Element {
  const router = useRouter();

  return (
    <Box
      role="alert"
      p={4}
      bg="red.50"
      borderRadius="md"
      borderWidth={1}
      borderColor="red.200"
    >
      <Heading as="h3" size="md" color="red.600" mb={2}>
        Something went wrong
      </Heading>
      <Text color="red.700" mb={4}>
        {error.message}
      </Text>
      <Box>
        <Button
          onClick={resetErrorBoundary}
          colorScheme="red"
          size="sm"
          mr={2}
        >
          Try again
        </Button>
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
        >
          Go back
        </Button>
      </Box>
    </Box>
  );
}

export function TestRunErrorBoundary({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        console.error('TestRun Error:', error);
        // Send to error tracking service
      }}
      onReset={() => {
        // Reset any state that might have caused the error
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
} 