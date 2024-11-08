'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';

/**
 * TwoFactorBackupCodes is a component that displays and manages 2FA backup codes.
 * It provides functionality to copy and download backup codes for secure storage.
 */

interface TwoFactorBackupCodesProps {
  /** Array of backup codes to display */
  codes: string[];
  /** URL to redirect to after saving codes */
  redirectUrl: string;
}

/**
 * TwoFactorBackupCodes Component
 * 
 * @example
 * ```tsx
 * <TwoFactorBackupCodes
 *   codes={['123456', '789012']}
 *   redirectUrl="/settings/security"
 * />
 * ```
 */
export function TwoFactorBackupCodes({
  codes,
  redirectUrl,
}: TwoFactorBackupCodesProps) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy codes:', error);
    }
  }, [codes]);

  const downloadCodes = React.useCallback(() => {
    try {
      const blob = new Blob([codes.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'backup-codes.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download codes:', error);
    }
  }, [codes]);

  const handleComplete = React.useCallback(() => {
    router.push(redirectUrl);
  }, [router, redirectUrl]);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Save Backup Codes</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Save these backup codes in a secure place. You can use them to access
            your account if you lose access to your authenticator app.
          </AlertDescription>
        </Alert>

        <div className="bg-muted p-4 rounded-lg font-mono text-sm">
          {codes.map((code, index) => (
            <div
              key={code}
              className="flex justify-between items-center py-1"
              role="listitem"
            >
              <span>{code}</span>
              <span className="text-muted-foreground">
                {(index + 1).toString().padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={copyToClipboard}
            aria-label="Copy backup codes"
          >
            <Copy className="w-4 h-4 mr-2" aria-hidden="true" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={downloadCodes}
            aria-label="Download backup codes"
          >
            <Download className="w-4 h-4 mr-2" aria-hidden="true" />
            Download
          </Button>
        </div>

        <Button
          onClick={handleComplete}
          className="w-full"
          aria-label="Confirm backup codes saved"
        >
          I&apos;ve saved these codes
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * State Management:
 * - Tracks copy confirmation state
 * - Manages clipboard operations
 * - Handles file download process
 */

/**
 * Accessibility:
 * - Uses semantic HTML structure
 * - Includes proper ARIA labels
 * - Provides feedback for copy action
 * - Maintains keyboard navigation
 */

/**
 * Error Handling:
 * - Handles clipboard API errors
 * - Manages file download failures
 * - Provides user feedback
 */

/**
 * Performance Considerations:
 * - Memoized callback functions
 * - Efficient state updates
 * - Proper cleanup of resources
 */

/**
 * Props:
 * | Name       | Type       | Default | Description                               |
 * |------------|------------|---------|-------------------------------------------|
 * | codes      | string[]   | -       | Array of backup codes to display          |
 * | redirectUrl | string   | -       | URL to redirect to after saving codes     |
 */

/**
 * Best Practices:
 * - Secure handling of sensitive data
 * - Clear user instructions
 * - Multiple save options
 * - Proper feedback mechanisms
 */

/**
 * Related Components:
 * - TwoFactorSetup
 * - TwoFactorVerification
 * - SecuritySettings
 */ 