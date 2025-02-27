import React from 'react';
import logger from '@/lib/logger';

export const metadata = {
  title: 'Dashboard - Test Management Application',
  description: 'View and manage your test projects',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  logger.debug('Rendering DashboardLayout');
  
  return (
    <div className="dashboard-layout">
      {children}
    </div>
  );
} 