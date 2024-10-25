'use client';

import { VStack, Button, Icon, Text, Divider } from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { FaGithub, FaGoogle } from 'react-icons/fa';

interface SocialLoginButtonsProps {
  callbackUrl?: string;
}

export function SocialLoginButtons({ callbackUrl = '/' }: SocialLoginButtonsProps) {
  return (
    <VStack spacing={4} width="100%">
      <Divider />
      <Button
        width="full"
        onClick={() => signIn('github', { callbackUrl })}
        leftIcon={<Icon as={FaGithub} />}
        variant="outline"
      >
        Continue with GitHub
      </Button>
      <Button
        width="full"
        onClick={() => signIn('google', { callbackUrl })}
        leftIcon={<Icon as={FaGoogle} />}
        variant="outline"
      >
        Continue with Google
      </Button>
    </VStack>
  );
}
