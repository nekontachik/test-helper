import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Flex flex={1}>
        <Sidebar />
        <Box as="main" flex={1} maxW="container.xl" mx="auto" py={8}>
          {children}
        </Box>
      </Flex>
      <Footer />
    </Box>
  );
};
