'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onResend: () => Promise<void>;
}

export function EmailVerification({ email, onResend }: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleResend = async () => {
    try {
      setIsResending(true);
      await onResend();
      setResendStatus('success');
    } catch (error) {
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <h2 className="text-2xl font-bold">Verify Your Email</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
          We sent a verification link to:
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
        {resendStatus === 'success' && (
          <Alert variant="success">
            <AlertDescription>
              A new verification email has been sent.
            </AlertDescription>
          </Alert>
        )}
        {resendStatus === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to resend verification email. Please try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          onClick={handleResend}
          disabled={isResending}
          className="w-full"
        >
          {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Resend Verification Email
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Didn't receive the email? Check your spam folder.
        </p>
      </CardFooter>
    </Card>
  );
}
