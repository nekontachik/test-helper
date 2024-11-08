'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

export function LoginForm() {
  const [error, setError] = useState<LoginError | null>(null);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 423) {
          setError({
            message: 'Account is locked due to too many failed attempts',
            lockoutRemaining: result.lockoutRemaining,
          });
        } else {
          setError({
            message: result.error,
            remainingAttempts: result.remainingAttempts,
          });
        }
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      setError({
        message: 'An unexpected error occurred',
      });
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
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          )}
          Sign In
        </Button>
      </Form>
    </div>
  );
} 