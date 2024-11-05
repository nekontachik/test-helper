import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { renderWithChakra } from '@/test/utils';

describe('ErrorBoundary', () => {
  const ErrorComponent = () => {
    throw new Error('Test error');
  };

  it('renders error message when an error occurs', () => {
    renderWithChakra(
      <ErrorBoundary 
        fallback={({ error }) => (
          <div>
            <div>Something went wrong.</div>
            <div>{error.message}</div>
          </div>
        )}
      >
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});
