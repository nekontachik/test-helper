'use client';

import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ChakraProvider>
      </body>
    </html>
  );
}
