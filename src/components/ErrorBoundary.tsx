'use client';

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button, Code, Stack } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box textAlign="center" p={8} maxW="800px" mx="auto">
          <Heading as="h2" size="xl" mb={4} color="red.500">
            Something went wrong
          </Heading>
          <Text fontSize="lg" mb={6}>
            An error occurred in the application. Please try refreshing the page.
          </Text>
          
          <Stack spacing={4} mb={8}>
            {this.state.error && (
              <Box p={4} bg="red.50" borderRadius="md" textAlign="left">
                <Text fontWeight="bold" mb={2}>Error:</Text>
                <Code p={2} colorScheme="red" display="block" whiteSpace="pre-wrap">
                  {this.state.error.toString()}
                </Code>
              </Box>
            )}
            
            {this.state.errorInfo && (
              <Box p={4} bg="gray.50" borderRadius="md" textAlign="left">
                <Text fontWeight="bold" mb={2}>Component Stack:</Text>
                <Code p={2} colorScheme="gray" display="block" whiteSpace="pre-wrap" fontSize="sm" overflowX="auto">
                  {this.state.errorInfo.componentStack}
                </Code>
              </Box>
            )}
          </Stack>
          
          <Button
            colorScheme="blue"
            onClick={() => window.location.reload()}
            mr={4}
          >
            Refresh Page
          </Button>
          <Button
            variant="outline"
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
