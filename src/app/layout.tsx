'use client';

import React from 'react';
import { Providers } from '@/components/providers';
import logger from '@/lib/utils/logger';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { PWAInit } from '@/components/PWAInit';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  logger.debug('Rendering RootLayout');

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body suppressHydrationWarning={true}>
        <PWAInit />
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
