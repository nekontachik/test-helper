'use client';

import type { ErrorInfo, ReactNode } from 'react';
import React, { Component } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Code,
  useColorModeValue,
} from '@chakra-ui/react';
import { logger } from '@/lib/utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Error caught by ErrorBoundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  resetErrorBoundary = (): void => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps): React.ReactElement {
  const bgColor = useColorModeValue('red.50', 'red.900');
  const borderColor = useColorModeValue('red.200', 'red.700');

  return (
    <Box
      p={6}
      m={4}
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack align="start" spacing={4}>
        <Heading as="h2" size="lg" color="red.500">
          Something went wrong
        </Heading>
        <Text>An error occurred in the application.</Text>
        {error && (
          <Box w="100%" p={3} bg="blackAlpha.100" borderRadius="md">
            <Text fontWeight="bold" mb={2}>
              Error:
            </Text>
            <Code w="100%" p={2} borderRadius="md" variant="subtle">
              {error.message}
            </Code>
          </Box>
        )}
        <Button colorScheme="red" onClick={resetErrorBoundary}>
          Try again
        </Button>
      </VStack>
    </Box>
  );
}
