'use client';

import React from 'react';
import { 
  Box, 
  VStack, 
  Flex, 
  Text, 
  Icon, 
  Divider,
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  FiHome, 
  FiFolder, 
  FiFileText, 
  FiPlay, 
  FiBarChart2, 
  FiSettings,
  FiLogOut
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface NavItemProps {
  icon: React.ElementType;
  children: string;
  href: string;
  isActive?: boolean;
}

const NavItem = ({ icon, children, href, isActive }: NavItemProps): JSX.Element => {
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.700', 'blue.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  
  return (
    <Tooltip label={children} placement="right" hasArrow openDelay={500}>
      <Link href={href} passHref style={{ textDecoration: 'none', width: '100%' }}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : undefined}
          _hover={{
            bg: hoverBg,
          }}
        >
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
            color={isActive ? activeColor : undefined}
          />
          <Text fontWeight={isActive ? 'medium' : 'normal'}>{children}</Text>
        </Flex>
      </Link>
    </Tooltip>
  );
};

export const Sidebar = (): JSX.Element => {
  const { logout } = useAuth();
  const pathname = usePathname();
  
  const handleLogout = async (): Promise<void> => {
    await logout();
  };
  
  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      h="100vh"
      w="64"
      bg={useColorModeValue('white', 'gray.800')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      display={{ base: 'none', md: 'block' }}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold">Test Manager</Text>
      </Flex>
      <VStack spacing={1} align="stretch" mt={4}>
        <NavItem icon={FiHome} href="/dashboard" isActive={pathname === '/dashboard'}>
          Dashboard
        </NavItem>
        <NavItem icon={FiFolder} href="/projects" isActive={pathname?.startsWith('/projects')}>
          Projects
        </NavItem>
        <NavItem icon={FiFileText} href="/test-cases" isActive={pathname?.startsWith('/test-cases')}>
          Test Cases
        </NavItem>
        <NavItem icon={FiPlay} href="/test-runs" isActive={pathname?.startsWith('/test-runs')}>
          Test Runs
        </NavItem>
        <NavItem icon={FiBarChart2} href="/reports" isActive={pathname?.startsWith('/reports')}>
          Reports
        </NavItem>
        
        <Divider my={4} />
        
        <NavItem icon={FiSettings} href="/settings" isActive={pathname?.startsWith('/settings')}>
          Settings
        </NavItem>
        
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
              mr="4"
              fontSize="16"
              as={FiLogOut}
            />
            <Text>Logout</Text>
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
}; 