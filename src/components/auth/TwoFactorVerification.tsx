'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

const verifySchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

type FormData = z.infer<typeof verifySchema>;

interface TwoFactorVerificationProps {
  secret: string;
  onComplete: (backupCodes: string[]) => void;
}

export function TwoFactorVerification({
  secret,
  onComplete,
}: TwoFactorVerificationProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          token: data.code,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      const { backupCodes } = await response.json();
      onComplete(backupCodes);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Verify Setup</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          Enter the 6-digit code from your authenticator app to verify the setup.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                    />
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
              Verify and Continue
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 