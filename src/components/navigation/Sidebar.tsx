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
import { useTheme } from '@/components/providers/ThemeProvider';
import { getChakraStyleProps as _getChakraStyleProps } from '@/lib/ui-utils';

interface NavItemProps {
  icon: typeof FiHome;
  children: string;
  href: string;
  isActive?: boolean;
  isCollapsed?: boolean;
}

const NavItem = ({ icon, children, href, isActive, isCollapsed }: NavItemProps): JSX.Element => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const defaultActiveBg = useColorModeValue('gray.100', 'gray.700');
  const defaultHoverBg = useColorModeValue('gray.100', 'gray.700');
  const defaultActiveColor = useColorModeValue('blue.600', 'blue.300');
  
  // Determine colors based on theme
  const activeBg = isDarkMode ? '#334155' : defaultActiveBg;
  const hoverBg = isDarkMode ? '#334155' : defaultHoverBg;
  const activeColor = isDarkMode ? '#38bdf8' : defaultActiveColor;
  const textColor = isDarkMode ? '#f8fafc' : 'inherit';
  
  return (
    <Tooltip label={children} placement="right" hasArrow openDelay={500} isDisabled={!isCollapsed}>
      <Link href={href} passHref style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : textColor}
          _hover={{
            bg: hoverBg,
            color: activeColor,
          }}
          borderWidth={isActive ? (isDarkMode ? '2px' : '1px') : (isDarkMode ? '1px' : '0')}
          borderColor={isActive ? (isDarkMode ? '#38bdf8' : '#666666') : (isDarkMode ? '#475569' : 'transparent')}
          boxShadow={isActive ? (isDarkMode ? '0 0 5px rgba(56, 189, 248, 0.5)' : '0 1px 3px rgba(0, 0, 0, 0.1)') : 'none'}
          mb={1}
          transition="all 0.2s"
          className={isActive ? 'active-nav-item' : 'nav-item'}
        >
          <Icon
            mr={isCollapsed ? 0 : 4}
            fontSize="16"
            boxSize={5}
            as={icon}
            color={isActive ? activeColor : textColor}
            _groupHover={{ color: activeColor }}
          />
          <Collapse in={!isCollapsed} animateOpacity>
            <Text
              fontWeight={isActive ? 'semibold' : 'normal'} 
              fontSize="sm"
            >
              {children}
            </Text>
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
  
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const defaultBgColor = useColorModeValue('white', 'gray.900');
  const defaultBorderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Determine colors based on theme
  const bgColor = isDarkMode ? '#1e293b' : defaultBgColor;
  const borderColor = isDarkMode ? '#38bdf8' : defaultBorderColor;
  
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
      bg={bgColor}
      borderRight="solid"
      borderRightWidth={isDarkMode ? '2px' : '1px'}
      borderColor={borderColor}
      transition="all 0.2s"
      transform={{
        base: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        md: 'translateX(0)',
      }}
      zIndex="sticky"
      display={{ base: isSidebarOpen ? 'block' : 'none', md: 'block' }}
      aria-label="Main Navigation"
      boxShadow={isDarkMode ? '0 0 10px rgba(56, 189, 248, 0.3)' : '0 2px 10px rgba(0, 0, 0, 0.05)'}
      className={isDarkMode ? 'dark-sidebar' : 'light-sidebar'}
    >
      <VStack spacing={isDarkMode ? 2 : 1} align="stretch" py={4} px={2}>
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
        <NavItem
          icon={FiSettings}
          href="/settings"
          isActive={isActive('/settings')}
          isCollapsed={isCollapsed}
        >
          Settings
        </NavItem>
        
        <Box mt="auto" pt={4}>
          <Flex
            align="center"
            p="4"
            mx="4"
            borderRadius="lg"
            role="group"
            cursor="pointer"
            onClick={handleLogout}
            _hover={{
              bg: isDarkMode ? '#334155' : 'gray.100',
            }}
            bg="transparent"
            borderWidth={isDarkMode ? '1px' : '0'}
            borderColor={isDarkMode ? '#475569' : 'transparent'}
          >
            <Icon
              mr={isCollapsed ? 0 : 4}
              fontSize={isDarkMode ? '20px' : '18px'}
              as={FiLogOut}
              color={isDarkMode ? '#f8fafc' : 'inherit'}
            />
            <Collapse in={!isCollapsed} animateOpacity>
              <Text 
                fontWeight="semibold" 
                fontSize="sm"
              >
                Logout
              </Text>
            </Collapse>
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
}; 