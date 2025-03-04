import { Box, Flex, VStack, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { FiHome, FiFolder, FiFileText, FiPlay, FiBarChart2 } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthStatus } from '../AuthStatus';

interface NavItemProps {
  icon: typeof FiHome;
  children: string;
  href: string;
  isActive?: boolean;
}

function NavItem({ icon, children, href, isActive }: NavItemProps): JSX.Element {
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Link href={href} style={{ width: '100%' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        _hover={{
          bg: isActive ? activeBg : hoverBg,
        }}
      >
        <Icon
          mr="4"
          fontSize="16"
          as={icon}
          color={isActive ? 'blue.500' : 'gray.500'}
        />
        <Text color={isActive ? 'blue.500' : 'gray.500'}>{children}</Text>
      </Flex>
    </Link>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps): JSX.Element {
  const pathname = usePathname();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box
        w="64"
        bg={bg}
        borderRight="1px"
        borderColor={borderColor}
        pos="fixed"
        h="full"
      >
        <VStack spacing="1" align="stretch" py="5">
          <Box px="4" mb="6">
            <Text fontSize="xl" fontWeight="bold" color="blue.500">
              Test Helper
            </Text>
          </Box>
          <NavItem 
            icon={FiHome} 
            href="/dashboard"
            isActive={pathname === '/dashboard'}
          >
            Dashboard
          </NavItem>
          <NavItem 
            icon={FiFolder} 
            href="/projects"
            isActive={pathname === '/projects'}
          >
            Projects
          </NavItem>
          <NavItem 
            icon={FiFileText} 
            href="/test-cases"
            isActive={pathname === '/test-cases'}
          >
            Test Cases
          </NavItem>
          <NavItem 
            icon={FiPlay} 
            href="/test-runs"
            isActive={pathname === '/test-runs'}
          >
            Test Runs
          </NavItem>
          <NavItem 
            icon={FiBarChart2} 
            href="/reports"
            isActive={pathname === '/reports'}
          >
            Reports
          </NavItem>
        </VStack>
      </Box>

      {/* Main content */}
      <Box ml="64" flex="1" p="8">
        <Flex mb="8" justify="space-between" align="center">
          <Box>
            {/* Page title and breadcrumbs can go here */}
          </Box>
          <AuthStatus />
        </Flex>
        {children}
      </Box>
    </Flex>
  );
} 