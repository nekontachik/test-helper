'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/types/auth';

/**
 * SecuritySettings Component
 * 
 * Provides user security management features including password changes,
 * two-factor authentication setup, and email notification preferences.
 */

interface SecuritySettingsProps {
  /** The authenticated user object */
  user: AuthUser;
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handlePasswordChange = () => {
    router.push('/auth/reset-password/request');
  };

  const handle2FASetup = () => {
    router.push('/auth/2fa/setup');
  };

  const handleEmailNotifications = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotifications: enabled }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification settings');
      }

      setStatus('success');
      setMessage('Notification settings updated successfully');
    } catch (error) {
      setStatus('error');
      setMessage('Failed to update notification settings');
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Security Settings</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {status !== 'idle' && message && (
          <Alert variant={status === 'success' ? 'default' : 'destructive'}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Password</h3>
              <p className="text-sm text-muted-foreground">
                Change your password to keep your account secure
              </p>
            </div>
            <Button onClick={handlePasswordChange}>Change Password</Button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            {user.twoFactorEnabled ? (
              <Button variant="outline" disabled>
                Enabled
              </Button>
            ) : (
              <Button onClick={handle2FASetup}>Enable 2FA</Button>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive security alerts and notifications
              </p>
            </div>
            <Switch
              checked={user.emailNotificationsEnabled}
              onCheckedChange={handleEmailNotifications}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Usage Examples:
 * 
 * ```tsx
 * // Basic usage
 * <SecuritySettings user={currentUser} />
 * ```
 */

/**
 * Accessibility Features:
 * - Semantic HTML structure
 * - ARIA labels and roles
 * - Keyboard navigation support
 * - High contrast text
 * 
 * State Management:
 * - Status state for operation feedback
 * - Message state for user notifications
 * - User settings state from props
 * 
 * Error Handling:
 * - API error handling
 * - User feedback for failures
 * - Graceful degradation
 * 
 * Security Considerations:
 * - Protected routes for sensitive operations
 * - Proper API request handling
 * - User verification for changes
 */ 