import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorHandlingExample } from '@/components/ErrorHandlingExample';
import { useErrorHandler } from '@/hooks/useErrorHandler';

jest.mock('@/hooks/useErrorHandler');

describe('ErrorHandlingExample', () => {
  beforeEach(() => {
    (useErrorHandler as jest.Mock).mockReturnValue({
      handleError: jest.fn(),
    });
  });

  it('renders without crashing', () => {
    render(<ErrorHandlingExample />);
    expect(screen.getByText('Simulate Error')).toBeInTheDocument();
  });

  it('calls handleError when error is simulated', () => {
    const mockHandleError = jest.fn();
    (useErrorHandler as jest.Mock).mockReturnValue({
      handleError: mockHandleError,
    });

    render(<ErrorHandlingExample />);
    fireEvent.click(screen.getByText('Simulate Error'));

    expect(mockHandleError).toHaveBeenCalledWith(expect.any(Error));
  });
});
