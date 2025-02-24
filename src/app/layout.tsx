'use client';

import React, { useEffect } from 'react';
import { Providers } from '@/components/providers';
import logger from '@/lib/utils/logger';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  logger.debug('Rendering RootLayout');

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
