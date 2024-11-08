'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingScreen } from '@/components/LoadingScreen';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
} from '@chakra-ui/react';
import { useToast } from '@/components/ui/use-toast';
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/auth/redirects";
import { AUTH_ERRORS, getErrorMessage } from '@/lib/utils/error';
import { SESSION_DURATIONS } from '@/lib/auth/session';
import { useCSRF } from '@/hooks/useCSRF';
import { PasswordInput } from '@/components/PasswordInput';
import { validatePassword } from '@/lib/utils/password';

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function SignIn() {
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const csrfToken = useCSRF();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      const callbackUrl = searchParams?.get("callbackUrl") || DEFAULT_LOGIN_REDIRECT;
      window.location.replace(callbackUrl);
    }
  }, [status, searchParams]);

  if (status === "loading") {
    return <LoadingScreen message="Preparing sign in..." />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csrfToken) {
      toast({
        title: 'Error',
        description: AUTH_ERRORS.INVALID_CSRF,
        variant: 'destructive',
      });
      return;
    }

    const { isValid, errors } = validatePassword(formData.password);
    if (!isValid) {
      toast({
        title: 'Invalid Password',
        description: errors[0],
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        csrfToken,
        redirect: false,
        callbackUrl: searchParams?.get("callbackUrl") || DEFAULT_LOGIN_REDIRECT,
        maxAge: formData.rememberMe 
          ? SESSION_DURATIONS.REMEMBERED 
          : SESSION_DURATIONS.DEFAULT,
      });

      if (result?.error) {
        throw new Error(
          result.error === "CredentialsSignin" 
            ? AUTH_ERRORS.INVALID_CREDENTIALS 
            : result.error
        );
      }

      if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              autoComplete="email"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <PasswordInput
              name="password"
              value={formData.password}
              onValueChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
              disabled={isLoading}
              autoComplete="current-password"
              showStrengthMeter={true}
            />
          </FormControl>

          <FormControl>
            <Checkbox
              name="rememberMe"
              isChecked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              Remember me for 30 days
            </Checkbox>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isLoading}
            loadingText="Signing in..."
            spinner={<LoadingSpinner size="sm" />}
          >
            Sign In
          </Button>

          <Text>
            Don&apos;t have an account?{' '}
            <Button
              variant="link"
              onClick={() => router.push('/auth/register')}
              isDisabled={isLoading}
            >
              Register
            </Button>
          </Text>
        </VStack>
      </form>
    </Box>
  );
}
