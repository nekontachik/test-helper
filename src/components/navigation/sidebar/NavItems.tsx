'use client';

import React from 'react';
import { VStack } from '@chakra-ui/react';
import { 
  FiHome, 
  FiFolder, 
  FiPlay, 
  FiBarChart2, 
  FiSettings,
  FiCheckSquare
} from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { NavItem } from './NavItem';

interface NavItemsProps {
  isCollapsed: boolean;
}

export function NavItems({ isCollapsed }: NavItemsProps): JSX.Element {
  const pathname = usePathname() || '';
  
  // Function to check if a route is active
  const isActive = (route: string): boolean => {
    return pathname === route || pathname.startsWith(`${route}/`);
  };
  
  return (
    <VStack spacing={2} align="stretch" py={4} px={2}>
      <NavItem
        icon={FiHome}
        href="/dashboard"
        isActive={isActive('/dashboard')}
        isCollapsed={isCollapsed}
      >
        Dashboard
      </NavItem>
      <NavItem
        icon={FiFolder}
        href="/projects"
        isActive={isActive('/projects')}
        isCollapsed={isCollapsed}
      >
        Projects
      </NavItem>
      <NavItem
        icon={FiCheckSquare}
        href="/test-cases"
        isActive={isActive('/test-cases')}
        isCollapsed={isCollapsed}
      >
        Test Cases
      </NavItem>
      <NavItem
        icon={FiPlay}
        href="/test-runs"
        isActive={isActive('/test-runs')}
        isCollapsed={isCollapsed}
      >
        Test Runs
      </NavItem>
      <NavItem
        icon={FiBarChart2}
        href="/reports"
        isActive={isActive('/reports')}
        isCollapsed={isCollapsed}
      >
        Reports
      </NavItem>
      <NavItem
        icon={FiSettings}
        href="/settings"
        isActive={isActive('/settings')}
        isCollapsed={isCollapsed}
      >
        Settings
      </NavItem>
    </VStack>
  );
} 