import type { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import { Navbar } from '@/components/navigation/Navbar';
import { Sidebar } from '@/components/navigation/Sidebar';
import { useLayout } from '@/contexts/LayoutContext';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps): JSX.Element {
  const { isSidebarOpen } = useLayout();

  return (
    <Box minH="100vh">
      <Navbar />
      <Sidebar />
      <Box
        as="main"
        ml={{ base: 0, md: isSidebarOpen ? '240px' : '60px' }}
        transition="margin 0.2s"
        pt="60px" // Height of navbar
        px={6}
        py={8}
      >
        {children}
      </Box>
    </Box>
  );
} 