import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { Layout } from '@/components/Layout'; // Updated import statement

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('Layout', () => {
  it('renders children correctly', () => {
    render(
      <ChakraProvider>
        <Layout title="Test Title">
          <div data-testid="child-element">Child Content</div>
        </Layout>
      </ChakraProvider>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders navigation component', () => {
    render(
      <ChakraProvider>
        <Layout title="Test Title">
          <div>Content</div>
        </Layout>
      </ChakraProvider>
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
