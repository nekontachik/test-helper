'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  VStack,
  Text,
  useToast,
  Heading,
} from '@chakra-ui/react';
import { Button } from '@chakra-ui/button';
import { Input } from '@chakra-ui/input';
import { FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/form-control';
import { useRouter } from 'next/navigation';

const verifySchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

type FormData = z.infer<typeof verifySchema>;

interface TwoFactorVerifyProps {
  email: string;
  redirectUrl: string;
}

export function TwoFactorVerify({ email, redirectUrl }: TwoFactorVerifyProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: data.code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      toast({
        title: 'Verification successful',
        status: 'success',
        duration: 3000,
      });
      
      router.push(redirectUrl);
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={8}
      maxW="md"
      w="100%"
      mx="auto"
      bg="white"
      boxShadow="sm"
    >
      <VStack spacing={6}>
        <Heading size="lg" textAlign="center">
          Two-Factor Verification
        </Heading>
        
        <Text textAlign="center" color="gray.600">
          Enter the verification code from your authenticator app for:
          <br />
          <Text as="span" fontWeight="medium" color="gray.900">
            {email}
          </Text>
        </Text>

        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.code}>
              <FormLabel htmlFor="code" srOnly>
                Verification Code
              </FormLabel>
              <Input
                id="code"
                {...register('code')}
                placeholder="Enter 6-digit code"
                maxLength={6}
                textAlign="center"
                fontSize="2xl"
                letterSpacing="wider"
                autoComplete="one-time-code"
                inputMode="numeric"
              />
              <FormErrorMessage>
                {errors.code?.message}
              </FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={isSubmitting}
              loadingText="Verifying..."
            >
              Verify
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/auth/2fa/recovery')}
              width="100%"
            >
              Use recovery code
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
} 