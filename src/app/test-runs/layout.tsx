import React from 'react';
import type { Metadata } from 'next';
import { logger } from '@/lib/logger';

export const metadata: Metadata = {
  title: 'Test Runs | Testing Buddy',
  description: 'Create and manage your test runs',
};

export default function TestRunsLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  logger.debug('Rendering TestRunsLayout');
  
  return (
    <div className="test-runs-layout">
      {children}
    </div>
  );
} 