'use client';

import React, { useCallback } from 'react';
import { 
  Box, 
  VStack, 
  Flex, 
  Text, 
  Icon, 
  useColorModeValue,
  Tooltip,
  Collapse
} from '@chakra-ui/react';
import Link from 'next/link';
import { 
  FiHome, 
  FiFolder, 
  FiPlay, 
  FiBarChart2, 
  FiSettings,
  FiLogOut,
  FiList
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useLayout } from '@/contexts/LayoutContext';
import { usePathname } from 'next/navigation';

interface NavItemProps {
  icon: typeof FiHome;
  children: string;
  href: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

const NavItem = ({ icon, children, href, isActive, isCollapsed }: NavItemProps): JSX.Element => {
  const activeBg = useColorModeValue('gray.100', 'gray.700');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeColor = useColorModeValue('blue.500', 'blue.200');
  
  return (
    <Tooltip label={children} placement="right" hasArrow openDelay={500} isDisabled={!isCollapsed}>
      <Link href={href} passHref style={{ textDecoration: 'none', width: '100%' }}>
        <Flex
          align="center"
          px={4}
          py={3}
          cursor="pointer"
          role="group"
          transition="all 0.2s"
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : 'inherit'}
          _hover={{
            bg: hoverBg,
            color: activeColor,
          }}
          borderRadius="md"
        >
          <Icon
            as={icon}
            boxSize={5}
            mr={isCollapsed ? 0 : 4}
            transition="all 0.2s"
            _groupHover={{ color: activeColor }}
          />
          <Collapse in={!isCollapsed} animateOpacity>
            <Text>{children}</Text>
          </Collapse>
        </Flex>
      </Link>
    </Tooltip>
  );
};

export const Sidebar = (): JSX.Element => {
  const { logout } = useAuth();
  const { isSidebarOpen, isMobile: _isMobile } = useLayout();
  const pathname = usePathname() || '';
  
  const handleLogout = async (): Promise<void> => {
    await logout();
  };
  
  const isActive = useCallback((path: string) => {
    return pathname.startsWith(path);
  }, [pathname]);
  
  const isCollapsed = !isSidebarOpen;
  
  return (
    <Box
      as="aside"
      position="fixed"
      left={0}
      top="60px" // Height of navbar
      bottom={0}
      w={isSidebarOpen ? { base: 'full', md: '240px' } : '60px'}
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      transition="all 0.2s"
      transform={{
        base: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        md: 'translateX(0)',
      }}
      zIndex="sticky"
      display={{ base: isSidebarOpen ? 'block' : 'none', md: 'block' }}
      aria-label="Main Navigation"
    >
      <VStack spacing={1} align="stretch" py={4}>
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
          icon={FiList}
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
        
        <Box py={2}>
          <NavItem
            icon={FiSettings}
            href="/settings"
            isActive={isActive('/settings')}
            isCollapsed={isCollapsed}
          >
            Settings
          </NavItem>
        </Box>
        
        <Box px={4} mt={4}>
          <Flex
            align="center"
            p="4"
            mx="4"
            borderRadius="lg"
            role="group"
            cursor="pointer"
            onClick={handleLogout}
            _hover={{
              bg: useColorModeValue('gray.100', 'gray.700'),
            }}
          >
            <Icon
              mr={isCollapsed ? 0 : 4}
              fontSize="16"
              as={FiLogOut}
            />
            <Collapse in={!isCollapsed} animateOpacity>
              <Text>Logout</Text>
            </Collapse>
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
}; 