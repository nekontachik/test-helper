'use client';

import { useEffect } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { trackSessionActivity } from '@/lib/session-tracker';
import type { UserRole } from '@/types/auth';

export default function AdminDashboardPage(): JSX.Element {
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      // Track page access
      trackSessionActivity({
        userId: user.id,
        action: 'page_view',
        path: '/admin/dashboard',
        userAgent: navigator.userAgent
      });
    }
  }, [user]);
  
  return (
    <RoleProtectedRoute requiredRole={'ADMIN' as UserRole}>
      <Box p={8}>
        <Heading mb={6}>Admin Dashboard</Heading>
        <Box>Admin dashboard content goes here</Box>
      </Box>
    </RoleProtectedRoute>
  );
} 