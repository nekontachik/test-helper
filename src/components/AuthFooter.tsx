'use client';

import React from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';

export function AuthFooter(): React.ReactElement {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      as="footer" 
      bg={bgColor} 
      borderTop="1px" 
      borderColor={borderColor}
      py={6}
      mt="auto"
    >
      <Container maxW="container.lg">
        <VStack spacing={4}>
          <HStack spacing={4} justify="center">
            <Link href="/privacy" color="blue.500">
              Privacy Policy
            </Link>
            <Text color="gray.300">•</Text>
            <Link href="/terms" color="blue.500">
              Terms of Service
            </Link>
            <Text color="gray.300">•</Text>
            <Link href="/contact" color="blue.500">
              Contact Us
            </Link>
          </HStack>
          
          <Text fontSize="sm" color="gray.600">
            © {new Date().getFullYear()} Testing Buddy. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
