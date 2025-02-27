'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader } from 'lucide-react';

/**
 * TwoFactorVerify is a component that handles 2FA code verification.
 * It provides a form for users to enter their verification code and handles the verification process.
 */

interface TwoFactorVerifyProps {
  /** User's email address */
  email: string;
  /** Optional callback for custom navigation after verification */
  onVerifyComplete?: () => void;
  /** Optional redirect path after successful verification */
  redirectPath?: string;
}

type VerifyStatus = 'idle' | 'verifying' | 'success' | 'error';

/**
 * TwoFactorVerify Component
 * 
 * @example
 * ```tsx
 * <TwoFactorVerify 
 *   email="user@example.com"
 *   redirectPath="/dashboard"
 * />
 * ```
 */
export function TwoFactorVerify({
  email,
  onVerifyComplete,
  redirectPath = '/dashboard'
}: TwoFactorVerifyProps): JSX.Element {
  const router = useRouter();
  const [code, setCode] = React.useState('');
  const [status, setStatus] = React.useState<VerifyStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setStatus('verifying');
    setError(null);

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      setStatus('success');
      
      if (onVerifyComplete) {
        onVerifyComplete();
      } else {
        router.push(redirectPath);
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">
          Two-Factor Authentication
        </h2>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Enter the verification code sent to:
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </p>

          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter verification code"
            maxLength={6}
            className="text-center text-lg tracking-widest"
            aria-label="Verification code"
            disabled={status === 'verifying'}
            required
          />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={status === 'verifying' || !code}
          >
            {status === 'verifying' && (
              <Loader className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            Verify Code
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

/**
 * State Management:
 * - Tracks verification code input
 * - Manages verification status
 * - Handles error states
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
 * - Displays validation errors
 * - Shows API error messages
 * - Handles network errors
 */

/**
 * Performance Considerations:
 * - Minimal state updates
 * - Controlled input handling
 * - Optimized re-renders
 */

/**
 * Props:
 * | Name            | Type       | Default      | Description                               |
 * |-----------------|------------|--------------|-------------------------------------------|
 * | email           | string     | -            | User's email address                      |
 * | onVerifyComplete| () => void | undefined    | Optional callback after verification      |
 * | redirectPath    | string     | '/dashboard' | Path to redirect after success           |
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
 * - TwoFactorSetup
 * - TwoFactorStatus
 * - VerificationCodeInput
 */