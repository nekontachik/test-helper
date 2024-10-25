'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast'; // Separate import for toast
import NextLink from 'next/link';
import { RegisterData } from '@/types/auth';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData>();

  // Performance optimization: Memoize the submit handler
  const onSubmit = React.useCallback(async (data: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast({
        title: 'Registration successful',
        description: 'Please login with your credentials',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right', // Better UX position
      });

      router.push('/auth/login');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [router, toast]);

  // Performance optimization: Memoize form validation rules
  const validationRules = React.useMemo(() => ({
    name: {
      required: 'Name is required',
      minLength: {
        value: 2,
        message: 'Name must be at least 2 characters',
      },
    },
    email: {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address',
      },
    },
    password: {
      required: 'Password is required',
      minLength: {
        value: 8,
        message: 'Password must be at least 8 characters',
      },
    },
  }), []);

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg">
      <VStack spacing={6}>
        <Heading>Register</Heading>
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input
                {...register('name', validationRules.name)}
                autoComplete="name"
              />
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                {...register('email', validationRules.email)}
                autoComplete="email"
              />
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                {...register('password', validationRules.password)}
                autoComplete="new-password"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={isSubmitting}
              loadingText="Registering..."
            >
              Register
            </Button>
          </VStack>
        </form>

        <Text>
          Already have an account?{' '}
          <NextLink href="/auth/login" passHref>
            <Text as="span" color="blue.500" _hover={{ textDecoration: 'underline' }}>
              Login here
            </Text>
          </NextLink>
        </Text>
      </VStack>
    </Box>
  );
}
