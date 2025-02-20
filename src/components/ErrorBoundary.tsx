'use client';

import React from 'react';
import { logger } from '@/lib/utils/logger';

interface Props {
  children: React.ReactNode;
  onError?: (error: Error) => React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React Error Boundary caught error:', {
      error,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    const { children, onError } = this.props;
    const { hasError, error } = this.state;

    if (hasError && error) {
      if (onError) {
        return onError(error);
      }
      
      return (
        <div className="p-4 bg-red-50 rounded-md">
          <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
          <p className="mt-2 text-red-600">{error.message}</p>
        </div>
      );
    }

    return children;
  }
}
