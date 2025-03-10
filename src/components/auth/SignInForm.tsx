'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiEye, FiEyeOff, FiEyeOff as FiHighContrast } from 'react-icons/fi';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { logger } from '@/lib/logger';
import { ClientOnly } from '@/components/ClientOnly';
import { useTheme } from '@/components/providers/ThemeProvider';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

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
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const { login, isLoading } = useSupabaseAuth();
  const { isHighContrast, toggleHighContrast } = useTheme();

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

      // Log non-sensitive form data
      logger.info('Attempting sign in', { 
        email: data.email,
        hasPassword: !!data.password
      });

      const result = await login(data.email, data.password);
      
      if (!result.success) {
        throw new Error(result.error || 'Authentication failed. Please check your credentials and try again.');
      }

      logger.info('Sign in successful', { email: data.email });
    } catch (error) {
      logger.error('Sign in error:', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        email: data.email 
      });
      
      setAuthError({
        message: error instanceof Error 
          ? error.message 
          : 'Authentication failed. Please try again later.',
        code: 'AUTH_ERROR'
      });
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={toggleHighContrast}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-full"
          aria-label={isHighContrast ? 'Disable high contrast' : 'Enable high contrast'}
        >
          <FiHighContrast className="h-5 w-5" />
          <span className="sr-only">{isHighContrast ? 'Disable' : 'Enable'} high contrast</span>
        </button>
      </div>
      <Card className="shadow-md">
        <CardHeader className="bg-primary/5 pb-6">
          <CardTitle className="text-center text-2xl font-bold">Sign In</CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <ClientOnly fallback={
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium">Email</div>
                <div className="h-10 w-full animate-pulse rounded-md bg-gray-100"></div>
              </div>
              <div className="space-y-2">
                <div className="font-medium">Password</div>
                <div className="h-10 w-full animate-pulse rounded-md bg-gray-100"></div>
              </div>
              <div className="h-10 w-full animate-pulse rounded-md bg-primary/30 mt-6"></div>
            </div>
          }>
            {sessionError && (
              <div className="mb-4 rounded-md bg-amber-50 p-3 text-amber-800 border border-amber-200">
                {sessionError}
              </div>
            )}

            {authError && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-red-800 border border-red-200">
                {authError.message}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          type="email"
                          autoComplete="email"
                          disabled={isLoading || isRedirecting}
                          {...field}
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
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            disabled={isLoading || isRedirecting}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                          </button>
                        </div>
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
                  {isLoading || isRedirecting ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </Form>
          </ClientOnly>
        </CardContent>

        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 