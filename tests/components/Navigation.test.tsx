import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { Navigation } from '../../src/components/Navigation'; // Updated import path
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('Navigation', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/',
    });
  });

  it('renders navigation links correctly', () => {
    render(
      <ChakraProvider>
        <Navigation />
      </ChakraProvider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Test Runs')).toBeInTheDocument();
  });

  it('highlights the active link', () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/projects',
    });

    render(
      <ChakraProvider>
        <Navigation />
      </ChakraProvider>
    );

    const projectsLink = screen.getByText('Projects');
    expect(projectsLink).toHaveStyle('font-weight: bold');
  });
});
