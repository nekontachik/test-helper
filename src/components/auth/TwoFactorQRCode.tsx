'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import Image from 'next/image';

interface TwoFactorQRCodeProps {
  onComplete: (data: { secret: string; qrCode: string }) => void;
}

export function TwoFactorQRCode({ onComplete }: TwoFactorQRCodeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiate2FASetup = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to initiate 2FA setup');
      }

      const data = await response.json();
      onComplete(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to setup 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">
          Set up Two-Factor Authentication
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Enhance your account security by setting up two-factor authentication.
            You'll need an authenticator app like Google Authenticator or Authy.
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-64 mx-auto" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Button
              onClick={initiate2FASetup}
              disabled={isLoading}
              className="w-full"
            >
              Begin Setup
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 