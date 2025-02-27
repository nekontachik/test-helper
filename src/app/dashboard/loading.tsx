import React from 'react';
import logger from '@/lib/logger';

export default function DashboardLoading(): React.ReactNode {
  logger.debug('Rendering DashboardLoading');
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg">Loading dashboard...</p>
    </div>
  );
} 