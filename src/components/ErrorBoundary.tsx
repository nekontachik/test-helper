import React, { Component, ErrorInfo, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import logger from '@/lib/logger';

export interface ErrorBoundaryProps {
  children: ReactNode;
  errorMessage?: string;
  fallback?: (error: Error) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: uuidv4(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorId = this.state.errorId || uuidv4();
    
    // Log the error
    logger.error('Error caught by boundary:', {
      error,
      errorInfo,
      errorId,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!);
      }

      return (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <h2 className="text-lg font-semibold text-red-800">
            {this.props.errorMessage || 'Oops! Something went wrong.'}
          </h2>
          <p className="mt-2 text-sm text-red-600">{this.state.error?.message}</p>
          {this.state.errorId && (
            <p className="mt-1 text-xs text-red-500">Error ID: {this.state.errorId}</p>
          )}
          <button
            onClick={this.handleReset}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
