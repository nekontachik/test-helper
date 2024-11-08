'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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

/**
 * TwoFactorVerification is a component that handles the verification step
 * of two-factor authentication setup. It validates the code from an authenticator app.
 */

const verifySchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

type FormData = z.infer<typeof verifySchema>;

interface TwoFactorVerificationProps {
  /** Secret key for 2FA verification */
  secret: string;
  /** URL to redirect to after successful verification */
  redirectUrl: string;
}

/**
 * TwoFactorVerification Component
 * 
 * @example
 * ```tsx
 * <TwoFactorVerification
 *   secret="ABCDEF123456"
 *   redirectUrl="/settings/security"
 * />
 * ```
 */
export function TwoFactorVerification({
  secret,
  redirectUrl,
}: TwoFactorVerificationProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
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
      
      if (backupCodes) {
        localStorage.setItem('backupCodes', JSON.stringify(backupCodes));
      }

      router.push(redirectUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
      console.error('2FA verification error:', error);
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

        <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-4">
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
                      aria-label="Verification code"
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
              aria-label="Verify code"
            >
              Verify and Continue
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

/**
 * State Management:
 * - Uses React Hook Form for form state
 * - Tracks error state for API failures
 * - Manages form submission state
 */

/**
 * Accessibility:
 * - Uses semantic HTML structure
 * - Includes proper ARIA labels
 * - Provides error feedback
 * - Maintains keyboard navigation
 */

/**
 * Error Handling:
 * - Validates input with Zod schema
 * - Displays API error messages
 * - Logs errors to console
 */

/**
 * Performance Considerations:
 * - Uses controlled inputs
 * - Optimized form validation
 * - Minimal re-renders
 */

/**
 * Props:
 * | Name       | Type   | Default | Description                               |
 * |------------|--------|---------|-------------------------------------------|
 * | secret     | string | -       | Secret key for 2FA verification           |
 * | redirectUrl| string | -       | URL to redirect after successful verification |
 */

/**
 * Best Practices:
 * - Secure handling of 2FA secrets
 * - Clear error messages
 * - Loading state feedback
 * - Proper form validation
 */

/**
 * Related Components:
 * - TwoFactorSetup
 * - TwoFactorQRCode
 * - TwoFactorBackupCodes
 */