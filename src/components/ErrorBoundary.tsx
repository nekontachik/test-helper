import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={4} borderWidth={1} borderRadius="md" borderColor="red.500" bg="red.50">
          <Heading size="md" color="red.500">Something went wrong</Heading>
          <Text mt={2}>{this.state.error?.message || 'An unexpected error occurred.'}</Text>
        </Box>
      );
    }

    return this.props.children;
  }
}
