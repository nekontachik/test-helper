'use client';

import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

export interface Props {
  children: React.ReactNode;
  fallback?: (props: { error: Error }) => React.ReactNode;
  onCatch?: (error: Error) => void;
}

interface State {
  error: Error | null;
}

const DefaultFallback = React.memo(({ error }: { error: Error }) => (
  <VStack spacing={4} p={4}>
    <Text fontSize="lg" fontWeight="bold">Something went wrong</Text>
    <Text color="red.500">{error.message}</Text>
  </VStack>
));

DefaultFallback.displayName = 'DefaultFallback';

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (this.props.onCatch) {
      this.props.onCatch(error);
    }
  }

  render() {
    const { error } = this.state;
    const { children, fallback = DefaultFallback } = this.props;

    if (error) {
      return fallback({ error });
    }

    return children;
  }
}
