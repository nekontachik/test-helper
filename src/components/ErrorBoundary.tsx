import React, { ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // You can log the error to an error reporting service here
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box textAlign="center" py={10} px={6}>
          <VStack spacing={4}>
            <Heading as="h2" size="xl" color="red.500">
              Oops! Something went wrong.
            </Heading>
            <Text fontSize="lg">
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            {this.state.errorInfo && (
              <Text fontSize="sm" color="gray.500">
                {this.state.errorInfo.componentStack}
              </Text>
            )}
            <Button
              colorScheme="blue"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
