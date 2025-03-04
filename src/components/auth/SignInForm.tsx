'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { PasswordInput } from '@/components/ui/password-input';
import { logger } from '@/lib/utils/logger';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof loginSchema>;

interface AuthError {
  message: string;
  code?: string;
}

export function SignInForm(): JSX.Element {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check for error parameters in URL
  useEffect(() => {
    const error = searchParams?.get('error');
    if (error === 'SessionExpired') {
      setSessionError('Your session has expired. Please sign in again.');
      logger.info('Session expired, user redirected to login');
    }
  }, [searchParams]);

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      setIsRedirecting(true);
      setSessionError(null);
      setAuthError(null);

      // Get callback URL from search params, but don't process it yet
      const rawCallbackUrl = searchParams?.get('callbackUrl');
      const result = await login(data.email, data.password, rawCallbackUrl);

      if (!result) {
        throw new Error('Login failed');
      }
    } catch (error) {
      logger.error('Sign-in error:', { error });
      setAuthError({
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      });
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
      </CardHeader>

      <CardContent className="space-y-4">
        {sessionError && (
          <ErrorMessage
            title="Session Expired"
            message={sessionError}
            onClose={() => setSessionError(null)}
          />
        )}

        {authError && (
          <ErrorMessage
            title="Login Failed"
            message={authError.message}
            onClose={() => setAuthError(null)}
          />
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="your.email@example.com"
                    autoComplete="email"
                    disabled={isLoading || isRedirecting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    autoComplete="current-password"
                    disabled={isLoading || isRedirecting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isRedirecting}
          >
            {(isLoading || isRedirecting) ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                {isRedirecting ? 'Redirecting...' : 'Signing in...'}
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="text-center text-sm text-muted-foreground">
        <div className="flex w-full justify-between">
          <a href="/auth/reset-password" className="text-primary hover:underline">
            Forgot password?
          </a>
          <a href="/auth/register" className="text-primary hover:underline">
            Create an account
          </a>
        </div>
      </CardFooter>
    </Card>
  );
} 