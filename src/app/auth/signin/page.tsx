'use client';

import {
  Box,
  Button,
  Container,
  FormControl,
  Input,
  VStack,
  Text,
  Link as ChakraLink,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { logger } from '@/lib/utils/logger';

interface SignInFormData {
  email: string;
  password: string;
}

interface AuthError {
  message: string;
  code?: string;
}

export default function SignInPage(): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange'
  });
  
  const router = useRouter();
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const clearErrors = (): void => {
    setAuthError(null);
  };

  const handleAuthSuccess = async (): Promise<void> => {
    try {
      setIsRedirecting(true);
      await router.push('/dashboard');
    } catch (error) {
      logger.error('Navigation error:', { error });
      setAuthError({
        message: 'Failed to redirect after login. Please try again.'
      });
    } finally {
      setIsRedirecting(false);
    }
  };

  const onSubmit = async (data: SignInFormData): Promise<void> => {
    try {
      clearErrors();
      
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (!result?.ok || result?.error) {
        setAuthError({
          message: result?.error || 'Invalid email or password',
          code: 'AUTH_ERROR'
        });
        return;
      }

      await handleAuthSuccess();
    } catch (error) {
      logger.error('Sign-in error:', { error });
      setAuthError({
        message: 'An unexpected error occurred. Please try again.',
        code: 'UNKNOWN_ERROR'
      });
    }
  };

  const isLoading = isSubmitting || isRedirecting;

  return (
    <Container maxW="md" centerContent height="100vh" justifyContent="center">
      <Card w="100%" variant="outline" bg="white" boxShadow="lg">
        <CardBody p={8}>
          <VStack spacing={8} align="stretch">
            <Text 
              fontSize="2xl" 
              fontWeight="semibold" 
              color="gray.900"
              textAlign="center"
            >
              Sign in to your account to continue
            </Text>

            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!errors.email}>
                  <Input
                    type="email"
                    placeholder="Email"
                    size="lg"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'gray.400' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
                    autoComplete="username"
                    isDisabled={isLoading}
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      }
                    })}
                  />
                  {errors.email && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.email.message}
                    </Text>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <Input
                    type="password"
                    placeholder="Password"
                    size="lg"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'gray.400' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
                    autoComplete="current-password"
                    isDisabled={isLoading}
                    {...register('password', {
                      required: 'Password is required',
                      onChange: clearErrors
                    })}
                  />
                  {errors.password && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.password.message}
                    </Text>
                  )}
                </FormControl>

                {authError && (
                  <Text color="red.500" fontSize="sm" textAlign="center">
                    {authError.message}
                  </Text>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="100%"
                  isLoading={isLoading}
                  loadingText={isRedirecting ? 'Redirecting...' : 'Signing in...'}
                  mt={4}
                >
                  Sign in
                </Button>
              </VStack>
            </form>

            <Box w="100%" display="flex" justifyContent="space-between">
              <ChakraLink 
                as={Link} 
                href="/auth/forgot-password" 
                color="blue.500"
                fontSize="sm"
                _hover={{ textDecoration: 'none', color: 'blue.600' }}
                pointerEvents={isLoading ? 'none' : 'auto'}
                opacity={isLoading ? 0.5 : 1}
              >
                Forgot password?
              </ChakraLink>
              <ChakraLink 
                as={Link} 
                href="/auth/signup" 
                color="blue.500"
                fontSize="sm"
                _hover={{ textDecoration: 'none', color: 'blue.600' }}
                pointerEvents={isLoading ? 'none' : 'auto'}
                opacity={isLoading ? 0.5 : 1}
              >
                Create an account
              </ChakraLink>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}
