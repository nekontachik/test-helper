'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCsrfToken } from 'next-auth/react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { InitialStep } from './InitialStep';
import { ConfiguringStep } from './ConfiguringStep';
import { VerificationForm } from './VerificationForm';
import { SuccessMessage, ErrorMessage } from './StatusMessages';
import type { SubmitHandler } from "react-hook-form";
import type { 
  TwoFactorSetupProps, 
  SetupStatus, 
  VerifyResponse, 
  FormValues 
} from './types';
import { API_ENDPOINTS, ERROR_MESSAGES } from './types';

export function TwoFactorSetup({ 
  onComplete = '/settings', 
  onError 
}: TwoFactorSetupProps): JSX.Element {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<SetupStatus>('initial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      setSecret(null);
      setQrCode(null);
      if (status === 'success') {
        // Reset any form state if needed
      }
    };
  }, [status]);

  const handleRetry = (): void => {
    setStatus('initial');
  };

  const initiate2FASetup = async (): Promise<void> => {
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
          <InitialStep onSetup={initiate2FASetup} isLoading={isSubmitting} />
        )}

        {status === 'configuring' && (
          <ConfiguringStep qrCode={qrCode} secret={secret} />
        )}

        {(status === 'configuring') && (
          <VerificationForm 
            onSubmit={onSubmit} 
            isSubmitting={isSubmitting} 
            retryAfter={retryAfter}
            status={status}
          />
        )}

        {status === 'success' && <SuccessMessage />}

        {status === 'error' && <ErrorMessage onRetry={handleRetry} />}
      </CardContent>
    </Card>
  );
}

// Re-export all components for convenience
export * from './InitialStep';
export * from './ConfiguringStep';
export * from './VerificationForm';
export * from './StatusMessages';
export * from './types'; 