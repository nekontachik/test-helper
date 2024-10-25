import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary, { ErrorBoundaryProps } from '../ErrorBoundary';

// Mock the logger and error reporting service
jest.mock('@/lib/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));
jest.mock('@/lib/errorReporting', () => ({
  reportErrorToService: jest.fn(() => Promise.resolve()),
}));

// A component that throws an error
const ErrorComponent = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when an error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    expect(getByText('Oops! Something went wrong.')).toBeInTheDocument();
    expect(getByText('Test error')).toBeInTheDocument();
  });

  it('renders custom error message when provided', () => {
    const { getByText } = render(
      <ErrorBoundary errorMessage="Custom error message">
        <ErrorComponent />
      </ErrorBoundary>
    );
    expect(getByText('Custom error message')).toBeInTheDocument();
  });

  it('renders error ID when available', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    expect(getByText(/Error ID:/)).toBeInTheDocument();
  });

  it('resets error state when "Try again" is clicked', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    expect(getByText('Oops! Something went wrong.')).toBeInTheDocument();
    
    fireEvent.click(getByText('Try again'));
    
    // The error message should no longer be present
    expect(queryByText('Oops! Something went wrong.')).not.toBeInTheDocument();
  });

  it('uses custom fallback UI when provided', () => {
    const customFallback = (error: Error) => <div>Custom error: {error.message}</div>;
    const { getByText } = render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    expect(getByText('Custom error: Test error')).toBeInTheDocument();
  });

  it('uses custom error logger when provided', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalled();
  });

  it('renders fallback UI with error details', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    expect(getByText('Oops! Something went wrong.')).toBeInTheDocument();
    expect(getByText('Test error')).toBeInTheDocument();
    expect(getByText(/Error ID:/)).toBeInTheDocument();
  });
});
