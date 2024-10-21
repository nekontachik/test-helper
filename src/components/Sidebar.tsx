import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { Link as ChakraLink } from '@chakra-ui/next-js';

export const Sidebar: React.FC = () => {
  return (
    <Box width="200px" bg="gray.100" p={4}>
      <VStack align="stretch" spacing={4}>
        <ChakraLink as={NextLink} href="/projects">
          <Text>Projects</Text>
        </ChakraLink>
        <ChakraLink as={NextLink} href="/test-cases">
          <Text>Test Cases</Text>
        </ChakraLink>
        <ChakraLink as={NextLink} href="/test-runs">
          <Text>Test Runs</Text>
        </ChakraLink>
        <ChakraLink as={NextLink} href="/reports">
          <Text>Reports</Text>
        </ChakraLink>
      </VStack>
    </Box>
  );
};

export default Sidebar;
