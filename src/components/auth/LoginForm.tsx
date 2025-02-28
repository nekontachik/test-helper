'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { clearAuthState } from '@/utils/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof loginSchema>;

interface LoginError {
  message: string;
  remainingAttempts?: number;
  lockoutRemaining?: number;
}

export function LoginForm(): JSX.Element {
  const [error, setError] = useState<LoginError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ensure callbackUrl is a valid URL path
  const rawCallbackUrl = searchParams?.get('callbackUrl');
  const callbackUrl = rawCallbackUrl && rawCallbackUrl.startsWith('/') 
    ? rawCallbackUrl 
    : '/dashboard';

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    // Clear any previous auth state before attempting login
    clearAuthState();
    
    try {
      // Use NextAuth signIn instead of custom API
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (result?.error) {
        // Handle NextAuth error
        setError({
          message: result.error,
        });
        return;
      }

      // Only redirect on successful authentication
      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide more specific error messages based on error type
      if (error instanceof Error) {
        setError({
          message: `Authentication failed: ${error.message}`
        });
      } else {
        setError({
          message: 'Unable to sign in. Please check your network connection and try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error.message}
            {error.remainingAttempts !== undefined && (
              <p className="mt-1 text-sm">
                {error.remainingAttempts} attempts remaining before account lockout
              </p>
            )}
            {error.lockoutRemaining !== undefined && (
              <p className="mt-1 text-sm">
                Try again in {Math.ceil(error.lockoutRemaining / 60)} minutes
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Form form={form} onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" autoComplete="email" />
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
                <Input {...field} type="password" autoComplete="current-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading && (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          )}
          Sign In
        </Button>
      </Form>
    </div>
  );
} 