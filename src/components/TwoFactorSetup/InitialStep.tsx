'use client';

import { Button } from '@/components/ui/button';

interface InitialStepProps {
  onSetup: () => void;
  isLoading: boolean;
}

export function InitialStep({ onSetup, isLoading }: InitialStepProps): JSX.Element {
  return (
    <div className="text-center">
      <p className="mb-4">Enhance your account security by enabling two-factor authentication.</p>
      <Button onClick={onSetup} disabled={isLoading}>
        {isLoading ? 'Setting up...' : 'Set up 2FA'}
      </Button>
    </div>
  );
} 