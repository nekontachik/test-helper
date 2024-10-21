'use client';

import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <ChakraProvider>
              {children}
            </ChakraProvider>
          </SessionProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
