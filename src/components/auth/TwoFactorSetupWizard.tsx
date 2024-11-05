'use client';

import { useState } from 'react';
import { TwoFactorQRCode } from './TwoFactorQRCode';
import { TwoFactorVerification } from './TwoFactorVerification';
import { TwoFactorBackupCodes } from './TwoFactorBackupCodes';
import { Steps } from '@/components/ui/steps';

interface TwoFactorSetupWizardProps {
  onComplete: () => void;
}

type SetupStep = 'qr-code' | 'verification' | 'backup-codes' | 'complete';

export function TwoFactorSetupWizard({ onComplete }: TwoFactorSetupWizardProps) {
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

  const handleVerificationComplete = (backupCodes: string[]) => {
    setSetupData(prev => ({ ...prev, backupCodes }));
    setCurrentStep('backup-codes');
  };

  const handleBackupCodesComplete = () => {
    setCurrentStep('complete');
    onComplete();
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
          onComplete={handleVerificationComplete}
        />
      )}

      {currentStep === 'backup-codes' && setupData.backupCodes && (
        <TwoFactorBackupCodes
          codes={setupData.backupCodes}
          onComplete={handleBackupCodesComplete}
        />
      )}
    </div>
  );
} 