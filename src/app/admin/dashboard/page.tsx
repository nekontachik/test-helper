'use client';

import { useEffect } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAuth } from '@/hooks/useAuth';
import { trackSessionActivity } from '@/lib/session-tracker';

export default function AdminDashboardPage() {
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
    <RoleProtectedRoute requiredRole="ADMIN">
      <Box p={8}>
        <Heading mb={6}>Admin Dashboard</Heading>
        <AdminDashboard />
      </Box>
    </RoleProtectedRoute>
  );
} 