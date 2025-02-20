'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Box, Text, VStack, Flex } from '@chakra-ui/react';
import { logger } from '@/lib/utils/logger';
import { memo } from 'react';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInFormData = z.infer<typeof signInSchema>;

const FormFields = memo(function FormFields({ isLoading }: { isLoading: boolean }) {
  return (
    <>
      <FormField
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" {...field} disabled={isLoading} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
});

export function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.refresh();
      router.push('/dashboard');
    } catch (error) {
      logger.error('SignInForm - Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      as="main"
      maxW="md"
      mx="auto"
      mt={8}
      p={6}
      borderRadius="lg"
      boxShadow="sm"
      bg="white"
    >
      <VStack spacing={6} align="stretch">
        <Box textAlign="center" mb={6}>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Welcome Back
          </Text>
          <Text color="gray.600">
            Sign in to continue to your account
          </Text>
        </Box>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormFields isLoading={isLoading} />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? <Spinner className="mr-2" /> : null}
            Sign In
          </Button>
        </form>

        <Flex 
          justify="center" 
          mt={4} 
          pt={4} 
          borderTop="1px" 
          borderColor="gray.200"
        >
          <Text color="gray.600">
            Don&apos;t have an account?{' '}
            <Link 
              href="/auth/signup" 
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up here
            </Link>
          </Text>
        </Flex>
      </VStack>
    </Box>
  );
} 