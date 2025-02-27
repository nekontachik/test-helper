import type { ErrorInfo, ReactNode } from 'react';
import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class GlobalErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Box p={4}>
          <Heading as="h1" mb={4}>
            Oops! Something went wrong.
          </Heading>
          <Text mb={4}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
