'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  VStack,
  Heading,
  useToast,
  Link,
  Flex
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/hooks/useAuth';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export function SignInForm(): JSX.Element {
  const { login, isLoading: authLoading, error: authError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const router = useRouter();
  const toast = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const success = await login(data.email, data.password);
      
      if (success) {
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
        
        router.push('/dashboard');
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading) {
    return <LoadingState text="Checking authentication..." />;
  }
  
  return (
    <Box maxW="md" mx="auto" p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="lg" textAlign="center">
          Sign In
        </Heading>
        
        {(formError || authError) && (
          <ErrorMessage
            title="Login Failed"
            message={formError || authError || 'An error occurred during login'}
            onClose={() => setFormError(null)}
          />
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                autoComplete="email"
                {...register('email')}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                type="password"
                placeholder="********"
                autoComplete="current-password"
                {...register('password')}
              />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              mt={4}
              isLoading={isSubmitting}
              loadingText="Signing in..."
            >
              Sign In
            </Button>
          </VStack>
        </form>

        <Flex justifyContent="space-between" fontSize="sm">
          <Link as={NextLink} href="/auth/reset-password/request" color="blue.500">
            Forgot password?
          </Link>
          <Link as={NextLink} href="/auth/register" color="blue.500">
            Create an account
          </Link>
        </Flex>
      </VStack>
    </Box>
  );
} 