'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

const verifySchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

type FormData = z.infer<typeof verifySchema>;

interface TwoFactorSetupProps {
  onComplete: () => void;
}

export function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<'initial' | 'configuring' | 'success' | 'error'>('initial');

  const form = useForm<FormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  const initiate2FASetup = async () => {
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to initiate 2FA setup');

      const data = await response.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStatus('configuring');
    } catch (error) {
      setStatus('error');
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.code }),
      });

      if (!response.ok) throw new Error('Failed to verify 2FA code');

      setStatus('success');
      onComplete();
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Two-Factor Authentication Setup</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'initial' && (
          <div className="text-center">
            <p className="mb-4">Enhance your account security by enabling two-factor authentication.</p>
            <Button onClick={initiate2FASetup}>Set up 2FA</Button>
          </div>
        )}

        {status === 'configuring' && qrCode && (
          <>
            <div className="text-center space-y-4">
              <p>1. Scan this QR code with your authenticator app:</p>
              <div className="flex justify-center">
                <Image
                  src={qrCode}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                  className="border p-2"
                />
              </div>
              {secret && (
                <div className="text-sm">
                  <p>Or enter this code manually:</p>
                  <code className="bg-muted p-2 rounded">{secret}</code>
                </div>
              )}
              <p className="mt-4">2. Enter the verification code from your app:</p>
            </div>

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
                  Verify and Enable
                </Button>
              </form>
            </Form>
          </>
        )}

        {status === 'success' && (
          <Alert>
            <AlertDescription>
              Two-factor authentication has been successfully enabled for your account.
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to set up two-factor authentication. Please try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
