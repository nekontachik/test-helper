'use client';

import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <SessionProvider>
            <QueryClientProvider client={queryClient}>
              <ChakraProvider>{children}</ChakraProvider>
            </QueryClientProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
