'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  BoxProps,
} from '@chakra-ui/react';

interface AuthCardProps extends BoxProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function AuthCard({ 
  title, 
  subtitle, 
  children, 
  maxWidth = "md",
  ...props 
}: AuthCardProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={8}
      shadow="sm"
      width="100%"
      maxW={maxWidth}
      mx="auto"
      {...props}
    >
      <VStack spacing={6}>
        <VStack spacing={2} textAlign="center" width="100%">
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
