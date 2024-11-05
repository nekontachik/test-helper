import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary, Props as ErrorBoundaryProps } from '@/components/ErrorBoundary';
import { ChakraProvider } from '@chakra-ui/react';

describe('ErrorBoundary', () => {
  const ErrorComponent = () => {
    throw new Error('Test error');
  };

  beforeEach(() => {
    // Prevent console.error from cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderWithChakra = (component: React.ReactNode) => {
    return render(
      <ChakraProvider>
        {component}
      </ChakraProvider>
    );
  };

  it('renders error message when an error occurs', () => {
    renderWithChakra(
      <ErrorBoundary fallback={(error: Error) => (
        <div>
          <div>Something went wrong.</div>
          <div>{error.message}</div>
        </div>
      )}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('renders children when no error occurs', () => {
    renderWithChakra(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('calls onError callback when provided', () => {
    const mockOnError = jest.fn();

    renderWithChakra(
      <ErrorBoundary 
        fallback={(error: Error) => (
          <div>
            <div>Something went wrong.</div>
            <div>{error.message}</div>
          </div>
        )}
        onCatch={mockOnError}
      >
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
  });
});
