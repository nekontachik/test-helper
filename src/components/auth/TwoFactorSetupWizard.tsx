'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TwoFactorQRCode } from './TwoFactorQRCode';
import { TwoFactorVerification } from './TwoFactorVerification';
import { TwoFactorBackupCodes } from './TwoFactorBackupCodes';
import { Steps } from '../ui/steps';

interface TwoFactorSetupWizardProps {
  /** URL to redirect to after completion */
  redirectUrl: string;
}

type SetupStep = 'qr-code' | 'verification' | 'backup-codes';

export function TwoFactorSetupWizard({ redirectUrl }: TwoFactorSetupWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SetupStep>('qr-code');
  const [setupData, setSetupData] = useState<{
    secret?: string;
    qrCode?: string;
    backupCodes?: string[];
  }>({});

  const steps = [
    { id: 'qr-code', title: 'Scan QR Code' },
    { id: 'verification', title: 'Verify Code' },
    { id: 'backup-codes', title: 'Save Backup Codes' },
  ];

  const handleQRCodeComplete = (data: { secret: string; qrCode: string }) => {
    setSetupData(prev => ({ ...prev, ...data }));
    setCurrentStep('verification');
  };

  // Store backup codes in state when verification is complete
  const handleVerificationSuccess = (backupCodes: string[]) => {
    setSetupData(prev => ({ ...prev, backupCodes }));
    setCurrentStep('backup-codes');
  };

  return (
    <div className="space-y-8">
      <Steps
        steps={steps}
        currentStep={steps.findIndex(step => step.id === currentStep)}
      />

      {currentStep === 'qr-code' && (
        <TwoFactorQRCode onComplete={handleQRCodeComplete} />
      )}

      {currentStep === 'verification' && setupData.secret && (
        <TwoFactorVerification
          secret={setupData.secret}
          redirectUrl={`/api/auth/2fa/verify-success?next=${encodeURIComponent(window.location.pathname)}`}
        />
      )}

      {currentStep === 'backup-codes' && setupData.backupCodes && (
        <TwoFactorBackupCodes
          codes={setupData.backupCodes}
          redirectUrl={redirectUrl}
        />
      )}
    </div>
  );
} 