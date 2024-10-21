import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { Modal } from '@/components/Modal';

describe('Modal', () => {
  it('renders modal content when isOpen is true', () => {
    render(
      <ChakraProvider>
        <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      </ChakraProvider>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render modal content when isOpen is false', () => {
    render(
      <ChakraProvider>
        <Modal isOpen={false} onClose={jest.fn()} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      </ChakraProvider>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(
      <ChakraProvider>
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      </ChakraProvider>
    );

    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
