import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { Link as ChakraLink } from '@chakra-ui/next-js';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

export const Navigation: React.FC = () => {
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Test Runs', path: '/test-runs' },
  ];

  return (
    <Box as="nav" bg="gray.100" py={4}>
      <Flex justify="space-around" maxW="container.lg" mx="auto">
        {navItems.map((item) => (
          <NextLink key={item.name} href={item.path} passHref legacyBehavior>
            <ChakraLink
              href={item.path}
              fontWeight={router.pathname === item.path ? 'bold' : 'normal'}
              color={router.pathname === item.path ? 'blue.500' : 'gray.600'}
            >
              <Text>{item.name}</Text>
            </ChakraLink>
          </NextLink>
        ))}
      </Flex>
    </Box>
  );
};
