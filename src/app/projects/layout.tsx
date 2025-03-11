import React from 'react';
import type { Metadata } from 'next';
import { logger } from '@/lib/logger';

export const metadata: Metadata = {
  title: 'Projects | Testing Buddy',
  description: 'Create and manage your testing projects',
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  logger.debug('Rendering ProjectsLayout');
  
  return (
    <div className="projects-layout">
      {children}
    </div>
  );
} 