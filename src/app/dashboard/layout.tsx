import React from 'react';
import type { Metadata } from 'next';
import logger from '@/lib/logger';

export const metadata: Metadata = {
  title: 'Dashboard | Test Management System',
  description: 'View and manage your testing projects',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  logger.debug('Rendering DashboardLayout');
  
  return (
    <div className="dashboard-layout">
      {children}
    </div>
  );
} 