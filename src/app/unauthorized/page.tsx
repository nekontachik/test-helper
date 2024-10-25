'use client';

import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Icon,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { FiLock } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

export default function Unauthorized() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <Box maxW="md" mx="auto" mt={16} p={6}>
      <VStack spacing={6}>
        <Icon as={FiLock} boxSize={12} color="red.500" />
        <Heading size="lg" textAlign="center">
          Access Denied
        </Heading>
        <Text textAlign="center" color="gray.600">
          You don't have permission to access this page.
          {session?.user?.role && (
            <Text mt={2}>
              Current role: {session.user.role}
            </Text>
          )}
        </Text>
        <VStack spacing={4} width="100%">
          <Button
            width="full"
            onClick={() => router.back()}
            colorScheme="blue"
          >
            Go Back
          </Button>
          <Button
            width="full"
            variant="ghost"
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
