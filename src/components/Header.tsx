import React from 'react';
import { Box, Heading } from '@chakra-ui/react';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <Box as="header" bg="gray.100" py={4}>
      <Heading as="h1" size="lg">
        {title || 'Testing Buddy'}
      </Heading>
    </Box>
  );
};

export default Header;
