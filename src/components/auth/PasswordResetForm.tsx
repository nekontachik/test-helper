'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { PasswordInput } from '@/components/ui/password-input';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { logger } from '@/lib/utils/logger';
import { PASSWORD_RULES } from '@/lib/utils/password';

const resetSchema = z.object({
  password: z
    .string()
    .min(PASSWORD_RULES.minLength, `Password must be at least ${PASSWORD_RULES.minLength} characters`)
    .max(PASSWORD_RULES.maxLength, `Password must be less than ${PASSWORD_RULES.maxLength} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof resetSchema>;

interface ResetError {
  message: string;
  code?: string;
}

export function PasswordResetForm(): JSX.Element {
  const [error, setError] = useState<ResetError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const form = useForm<FormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    if (!token) {
      setError({ message: 'Reset token is missing', code: 'INVALID_TOKEN' });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Password reset failed');
      }

      // Redirect to login page on success
      router.push('/auth/signin?message=password-reset-success');
    } catch (error) {
      logger.error('Password reset error:', { error });
      setError({
        message: error instanceof Error ? error.message : 'Password reset failed',
        code: 'RESET_ERROR',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <ErrorMessage
            title="Reset Failed"
            message={error.message}
            onClose={() => setError(null)}
          />
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    onChange={onChange}
                    autoComplete="new-password"
                    disabled={isLoading}
                    showStrengthMeter
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field: { onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    onChange={onChange}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
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
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 