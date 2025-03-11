'use client';

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button, VStack, Code, useColorModeValue } from '@chakra-ui/react';

/**
 * Props for the ErrorFallback component
 */
export interface ErrorFallbackProps {
  /** The error that was caught */
  error: Error;
  /** Function to reset the error boundary */
  resetErrorBoundary: () => void;
}

/**
 * Fallback component to display when an error occurs
 */
const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps): JSX.Element => {
  const bgColor = useColorModeValue('red.50', 'red.900');
  const borderColor = useColorModeValue('red.300', 'red.700');
  const textColor = useColorModeValue('red.800', 'red.200');
  
  return (
    <Box
      p={4}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      role="alert"
    >
      <VStack align="start" spacing={3}>
        <Heading as="h3" size="md" color={textColor}>
          Something went wrong
        </Heading>
        
        <Text color={textColor}>
          {error.message || 'An unexpected error occurred'}
        </Text>
        
        <Box
          as="details"
          w="100%"
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          p={2}
        >
          <summary>Error details</summary>
          <Code
            display="block"
            whiteSpace="pre-wrap"
            p={2}
            mt={2}
            fontSize="sm"
            overflowX="auto"
          >
            {error.stack || 'No stack trace available'}
          </Code>
        </Box>
        
        <Button
          colorScheme="red"
          size="sm"
          onClick={resetErrorBoundary}
        >
          Try again
        </Button>
      </VStack>
    </Box>
  );
};

/**
 * Props for the ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  /** Fallback component to render when an error occurs */
  fallback?: React.ComponentType<ErrorFallbackProps>;
  /** Function to call when an error is caught */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Function to call when the error boundary is reset */
  onReset?: () => void;
  /** Children to render */
  children: ReactNode;
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The error that was caught */
  error: Error | null;
}

/**
 * Error boundary component that catches errors in its children
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log the error
    console.error('Error caught by ErrorBoundary:', error, info);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  resetErrorBoundary = (): void => {
    // Call the onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
    
    // Reset the state
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { fallback: FallbackComponent = ErrorFallback, children } = this.props;

    if (hasError && error) {
      return (
        <FallbackComponent
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary; 