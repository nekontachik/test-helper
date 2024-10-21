import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  it('renders message and type correctly', () => {
    render(<Toast message="Test message" type="success" onClose={() => {}} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-green-500');
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<Toast message="Test message" type="error" onClose={mockOnClose} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
