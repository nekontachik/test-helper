'use client';

import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SignOutButton } from './SignOutButton';

export function AuthHeader(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      as="header" 
      bg={bgColor} 
      borderBottom="1px" 
      borderColor={borderColor}
      py={4}
    >
      <Container maxW="container.lg">
        <Flex justify="space-between" align="center">
          <Heading 
            size="md" 
            cursor="pointer" 
            onClick={() => router.push('/')}
          >
            Test Management System
          </Heading>

          <HStack spacing={4}>
            {session ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/account/settings')}
                >
                  Settings
                </Button>
                <SignOutButton />
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/auth/signin')}
                >
                  Sign In
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={() => router.push('/auth/signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
