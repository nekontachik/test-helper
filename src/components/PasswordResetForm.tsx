'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

interface PasswordResetFormProps {
  token: string;
}

export function PasswordResetForm({ token }: PasswordResetFormProps): JSX.Element {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      if (!response.ok) throw new Error('Failed to reset password');
      
      setStatus('success');
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Reset Your Password</h2>
      </CardHeader>
      <CardContent>
        {status === 'success' ? (
          <Alert>
            <AlertDescription>
              Password reset successful! Redirecting to sign in...
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div>
              <FormLabel htmlFor="password">New Password</FormLabel>
              <Input 
                id="password"
                type="password" 
                autoComplete="new-password"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <div>
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
              <Input 
                id="confirmPassword"
                type="password" 
                autoComplete="new-password"
                {...form.register('confirmPassword')}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              Reset Password
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 