'use client';

import React from 'react';
import type { ReactNode } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps): JSX.Element {
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Sidebar />
      <Header />
      <Box 
        ml={{ base: 0, md: '16rem' }} 
        pt="60px"
        p={5}
      >
        {children}
      </Box>
    </Box>
  );
} 