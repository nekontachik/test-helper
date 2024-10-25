'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { ReactNode } from 'react';

interface AuthFormWrapperProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthFormWrapper({ children, title, subtitle }: AuthFormWrapperProps) {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      p={8}
      bg={bgColor}
      borderWidth={1}
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow="sm"
      width="100%"
      maxW="md"
      mx="auto"
    >
      <VStack spacing={6}>
        <VStack spacing={2} textAlign="center">
          <Heading size="lg">{title}</Heading>
          {subtitle && (
            <Text color="gray.600" fontSize="md">
              {subtitle}
            </Text>
          )}
        </VStack>
        {children}
      </VStack>
    </Box>
  );
}
