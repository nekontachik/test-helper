'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Link,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  Box,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { logger } from '@/lib/logger';
import { useRouter } from 'next/navigation';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof signUpSchema>;

interface AuthError {
  message: string;
  code?: string;
}

export function SignUpForm(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const { signUp, isLoading } = useSupabaseAuth();
  const toast = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      setIsSubmitting(true);
      setAuthError(null);

      // Log non-sensitive form data
      logger.info('Attempting sign up', { 
        email: data.email,
        hasPassword: !!data.password
      });

      const result = await signUp(data.email, data.password);
      
      if (!result.success) {
        throw new Error(result.error || 'Registration failed. Please try again.');
      }

      logger.info('Sign up successful', { email: data.email });
      setVerificationSent(true);
      toast({
        title: 'Registration successful',
        description: 'Please check your email for verification instructions.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      logger.error('Sign up error:', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        email: data.email 
      });
      
      setAuthError({
        message: error instanceof Error 
          ? error.message 
          : 'Registration failed. Please try again later.',
        code: 'AUTH_ERROR'
      });

      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Registration failed',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verificationSent) {
    return (
      <Box maxW="md" mx="auto" w="100%">
        <Card variant="elevated" shadow="md" borderRadius="lg" overflow="hidden">
          <CardHeader bg="blue.50" py={6}>
            <Heading size="lg" textAlign="center" color="blue.700">Check Your Email</Heading>
          </CardHeader>

          <CardBody py={8} px={6}>
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              We&apos;ve sent a verification link to your email. Please check your inbox and follow the instructions to complete your registration.
            </Alert>
            <VStack mt={6}>
              <Button 
                colorScheme="blue" 
                onClick={() => router.push('/auth/signin')}
                size="lg"
                height="50px"
                width="full"
                fontWeight="semibold"
              >
                Return to Sign In
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box maxW="md" mx="auto" w="100%">
      <Card variant="elevated" shadow="md" borderRadius="lg" overflow="hidden">
        <CardHeader bg="blue.50" py={6}>
          <Heading size="lg" textAlign="center" color="blue.700">Create Account</Heading>
        </CardHeader>

        <CardBody py={8} px={6}>
          <VStack spacing={6} align="stretch">
            {authError && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {authError.message}
              </Alert>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} style={{ width: '100%' }}>
              <VStack spacing={5} align="stretch">
                <FormControl isInvalid={!!form.formState.errors.email}>
                  <FormLabel fontWeight="medium">Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    autoComplete="email"
                    size="lg"
                    height="50px"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="gray.300"
                    _hover={{ borderColor: 'gray.400' }}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                    bg="white"
                    color="gray.800"
                    disabled={isLoading || isSubmitting}
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {form.formState.errors.email.message}
                    </Text>
                  )}
                </FormControl>

                <FormControl isInvalid={!!form.formState.errors.password}>
                  <FormLabel fontWeight="medium">Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      height="50px"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                      bg="white"
                      color="gray.800"
                      disabled={isLoading || isSubmitting}
                      {...form.register('password')}
                    />
                    <InputRightElement h="full">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="sm"
                        color="gray.500"
                      />
                    </InputRightElement>
                  </InputGroup>
                  {form.formState.errors.password && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {form.formState.errors.password.message}
                    </Text>
                  )}
                </FormControl>

                <FormControl isInvalid={!!form.formState.errors.confirmPassword}>
                  <FormLabel fontWeight="medium">Confirm Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      height="50px"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="gray.300"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                      bg="white"
                      color="gray.800"
                      disabled={isLoading || isSubmitting}
                      {...form.register('confirmPassword')}
                    />
                    <InputRightElement h="full">
                      <IconButton
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        variant="ghost"
                        size="sm"
                        color="gray.500"
                      />
                    </InputRightElement>
                  </InputGroup>
                  {form.formState.errors.confirmPassword && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {form.formState.errors.confirmPassword.message}
                    </Text>
                  )}
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  height="50px"
                  width="full"
                  mt={4}
                  fontWeight="semibold"
                  isLoading={isLoading || isSubmitting}
                  loadingText="Creating account..."
                >
                  Sign up
                </Button>
              </VStack>
            </form>
          </VStack>
        </CardBody>

        <CardFooter 
          bg="gray.50"
          pt={4} 
          pb={4}
          px={6}
          borderTop="1px"
          borderColor="gray.200"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize="sm">
            Already have an account?{' '}
            <Link href="/auth/signin" color="blue.600" fontWeight="medium">
              Sign in
            </Link>
          </Text>
        </CardFooter>
      </Card>
    </Box>
  );
} 