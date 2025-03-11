'use client';

import React from 'react';
import Dashboard from '../Dashboard';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { logger } from '@/lib/logger';

interface DashboardClientProps {
  user: Session['user'];
}

/**
 * Client-side wrapper for the Dashboard component
 * Receives the server-side user data and enhances it with client-side session data
 */
export default function DashboardClient({ user }: DashboardClientProps): JSX.Element {
  // Also use the client-side session to keep it in sync with any changes
  const { data: session } = useSession();
  
  logger.debug('Rendering DashboardClient', {
    component: 'DashboardClient',
    hasServerUser: !!user,
    hasClientSession: !!session
  });
  
  return (
    <Dashboard />
  );
} 