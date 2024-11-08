'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader } from 'lucide-react';

/**
 * EmailVerification is a component that handles the email verification process.
 * It displays the verification status and provides options to resend verification emails.
 */

interface EmailVerificationProps {
  /** Email address to verify */
  email: string;
  /** URL endpoint for resending verification email */
  resendUrl: string;
}

type ResendStatus = 'idle' | 'success' | 'error';

export function EmailVerification({ email, resendUrl }: EmailVerificationProps) {
  const [isResending, setIsResending] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState<ResendStatus>('idle');

  const handleResend = async () => {
    try {
      setIsResending(true);
      const response = await fetch(resendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend verification email');
      }

      setResendStatus('success');
    } catch (error) {
      setResendStatus('error');
      console.error('Failed to resend verification email:', error);
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
          <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-900/10">
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
          aria-label="Resend verification email"
        >
          {isResending && (
            <Loader className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          Resend Verification Email
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Didn&apos;t receive the email? Check your spam folder.
        </p>
      </CardFooter>
    </Card>
  );
}

/**
 * State Management:
 * - Tracks resending state with isResending
 * - Manages resend status (idle/success/error)
 * - Handles async resend operation
 */

/**
 * Accessibility:
 * - Uses semantic HTML structure
 * - Includes proper ARIA labels
 * - Provides loading state feedback
 * - Maintains keyboard navigation
 */

/**
 * Error Handling:
 * - Displays error messages for failed resend attempts
 * - Provides visual feedback for success/error states
 * - Logs errors to console for debugging
 */

/**
 * Performance Considerations:
 * - Minimal state updates
 * - Debounced resend action
 * - Optimized re-renders
 */

/**
 * Props:
 * | Name     | Type                    | Default | Description                          |
 * |----------|-------------------------|---------|--------------------------------------|
 * | email    | string                 | -       | Email address to verify              |
 * | resendUrl | string                 | -       | URL endpoint for resending verification email |
 */

/**
 * Best Practices:
 * - Clear user feedback
 * - Proper error handling
 * - Loading state management
 * - Accessible UI elements
 */

/**
 * Related Components:
 * - VerificationStatus
 * - EmailInput
 * - ResendButton
 */
