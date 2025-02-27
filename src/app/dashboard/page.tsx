'use client';

import React from 'react';
import Dashboard from '@/components/Dashboard';
import logger from '@/lib/logger';

export default function DashboardPage(): React.ReactNode {
  logger.info('Rendering Dashboard page', { component: 'DashboardPage' });
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <Dashboard />
    </main>
  );
} 