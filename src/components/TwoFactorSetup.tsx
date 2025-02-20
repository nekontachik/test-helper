'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { getCsrfToken } from 'next-auth/react';

const verifySchema = z.object({
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d+$/, 'Code must contain only numbers')
    .transform((val) => val.trim())
    .refine((val) => !isNaN(parseInt(val, 10)), {
      message: 'Code must be numeric'
    })
});

type FormValues = z.infer<typeof verifySchema>;

interface TwoFactorSetupProps {
  onComplete: string;
  onError?: (error: Error) => void;
}

type SetupStatus = 'initial' | 'configuring' | 'success' | 'error';

interface VerifyResponse {
  success: boolean;
  error?: string;
  backupCodes?: string[];
}

const API_ENDPOINTS = {
  SETUP: '/api/auth/2fa/setup',
} as const;

const ERROR_MESSAGES = {
  SETUP_FAILED: 'Failed to initiate 2FA setup',
  VERIFICATION_FAILED: 'Failed to verify 2FA code',
  INVALID_RESPONSE: 'Invalid server response',
} as const;

export function TwoFactorSetup({ 
  onComplete = '/settings', 
  onError 
}: TwoFactorSetupProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<SetupStatus>('initial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    if (status === 'initial') {
      form.reset();
      setQrCode(null);
      setSecret(null);
    }
  }, [status, form]);

  useEffect(() => {
    return () => {
      setSecret(null);
      setQrCode(null);
      if (status === 'success') {
        form.reset();
      }
    };
  }, [form, status]);

  const handleRetry = () => {
    setStatus('initial');
  };

  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const initiate2FASetup = async () => {
    setIsSubmitting(true);
    setStatus('initial');
    try {
      const response = await fetch(API_ENDPOINTS.SETUP, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || ERROR_MESSAGES.SETUP_FAILED);
      }

      if (!data.qrCode || !data.secret) {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStatus('configuring');
    } catch (error) {
      setStatus('error');
      const message = error instanceof Error ? error.message : 'An error occurred';
      onError?.(error instanceof Error ? error : new Error(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (retryAfter) {
      return;
    }
    
    setIsSubmitting(true);
    form.clearErrors();
    try {
      const csrfToken = await getCsrfToken();
      const headers = new Headers({
        'Content-Type': 'application/json',
      });
      if (csrfToken) {
        headers.set('X-CSRF-Token', csrfToken);
      }

      const response = await fetch(API_ENDPOINTS.SETUP, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({ 
          token: data.code,
          secret: secret
        }),
      });

      const responseData = (await response.json()) as VerifyResponse;
      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
          setRetryAfter(retryAfter);
          setTimeout(() => setRetryAfter(null), retryAfter * 1000);
          throw new Error('Too many attempts. Please try again later.');
        }
        throw new Error(responseData.error || ERROR_MESSAGES.VERIFICATION_FAILED);
      }

      if (!responseData.success) {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }

      if (responseData.backupCodes?.length) {
        try {
          localStorage.setItem('2faBackupCodes', JSON.stringify(responseData.backupCodes));
        } catch (e) {
          console.error('Failed to store backup codes:', e);
        }
      }

      setStatus('success');
      
      setTimeout(() => {
        if (onComplete.startsWith('/')) {
          router.push(onComplete);
        } else {
          window.dispatchEvent(new CustomEvent('2faSetupComplete', {
            detail: { action: onComplete }
          }));
        }
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setStatus('error');
      onError?.(error instanceof Error ? error : new Error(message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader role="heading" aria-level={1}>
        <h2 className="text-2xl font-bold text-center">
          Two-Factor Authentication Setup
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'initial' && (
          <div className="text-center">
            <p className="mb-4">Enhance your account security by enabling two-factor authentication.</p>
            <Button onClick={initiate2FASetup}>Set up 2FA</Button>
          </div>
        )}

        {status === 'configuring' && (
          <div className="text-center space-y-4">
            <p>1. Scan this QR code with your authenticator app:</p>
            <div className="flex justify-center">
              {qrCode && (
                <div 
                  className="border p-2"
                  dangerouslySetInnerHTML={{ __html: qrCode }}
                />
              )}
            </div>
            {secret && (
              <div className="text-sm">
                <p>Or enter this code manually:</p>
                <code className="bg-muted p-2 rounded">{secret}</code>
              </div>
            )}
            <p className="mt-4">2. Enter the verification code from your app:</p>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="Enter 6-digit code" inputMode="numeric" pattern="[0-9]*" maxLength={6} aria-label="Two-factor authentication code" autoComplete="one-time-code" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full mt-4" 
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" aria-hidden="true" />
                Verifying...
              </>
            ) : (
              'Verify and Enable'
            )}
          </Button>
        </form>

        {status === 'success' && (
          <Alert>
            <AlertDescription>
              Two-factor authentication has been successfully enabled for your account.
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert 
            variant="destructive"
            role="alert"
            aria-live="assertive"
          >
            <AlertDescription>
              Failed to set up two-factor authentication. Please try again.
            </AlertDescription>
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="mt-2"
            >
              Try Again
            </Button>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
