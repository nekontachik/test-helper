'use client';

import { useState, useEffect } from 'react';
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
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/contexts/AuthContext';
import logger from '@/lib/utils/logger';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export function SignInForm(): JSX.Element {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { login, error: authError, isLoading } = useAuth();
  
  // Check for error parameters in URL
  useEffect(() => {
    if (searchParams) {
      const error = searchParams.get('error');
      if (error === 'SessionExpired') {
        setSessionError('Your session has expired. Please sign in again.');
        logger.info('Session expired, user redirected to login');
      }
    }
  }, [searchParams]);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  
  const onSubmit = async (data: LoginFormData): Promise<void> => {
    try {
      logger.debug('Attempting sign in', { 
        email: data.email, 
        passwordLength: data.password.length
      });
      
      const success = await login(data.email, data.password);
      
      if (success) {
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 2000
        });
        
        setIsRedirecting(true);
        logger.debug('Redirecting to dashboard');
        router.push('/dashboard');
      }
    } catch (error) {
      logger.error('Sign in exception', { 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };
  
  if (isRedirecting) {
    return <LoadingState text="Redirecting..." />;
  }
  
  return (
    <Box maxW="md" mx="auto" p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="lg" textAlign="center">
          Sign In
        </Heading>
        
        {sessionError && (
          <Alert status="warning">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Session Expired</AlertTitle>
              <AlertDescription display="block">
                {sessionError}
              </AlertDescription>
            </Box>
            <CloseButton position="absolute" right="8px" top="8px" onClick={() => setSessionError(null)} />
          </Alert>
        )}
        
        {authError && (
          <ErrorMessage
            title="Login Failed"
            message={authError}
            onClose={() => {/* Error is managed by auth context */}}
          />
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="your.email@example.com"
                autoComplete="email"
                {...register('email')}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
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
              isLoading={isLoading}
              loadingText="Signing in..."
            >
              Sign In
            </Button>
          </VStack>
        </form>
        
        <Flex justify="space-between" fontSize="sm">
          <Link as={NextLink} href="/auth/reset-password" color="blue.500">
            Forgot password?
          </Link>
          <Link as={NextLink} href="/auth/signup" color="blue.500">
            Create an account
          </Link>
        </Flex>
      </VStack>
    </Box>
  );
} 