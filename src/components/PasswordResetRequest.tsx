'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof formSchema>;

export function PasswordResetRequest(): JSX.Element {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data: FormData) => {
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to send reset email');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
      </CardHeader>
      <CardContent>
        {status === 'success' ? (
          <Alert>
            <AlertDescription>
              If an account exists with this email, you will receive password reset instructions.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input 
                id="email"
                type="email" 
                placeholder="Enter your email" 
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={form.formState.isSubmitting}
            >
              Send Reset Link
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
        Remember your password? <a href="/auth/signin" className="text-primary hover:underline">Sign in</a>
      </CardFooter>
    </Card>
  );
} 