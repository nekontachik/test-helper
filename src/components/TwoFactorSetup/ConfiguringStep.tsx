'use client';

interface ConfiguringStepProps {
  qrCode: string | null;
  secret: string | null;
}

export function ConfiguringStep({ qrCode, secret }: ConfiguringStepProps): JSX.Element {
  return (
    <div className="text-center space-y-4">
      <p>1. Scan this QR code with your authenticator app:</p>
      <div className="flex justify-center">
        {qrCode && (
          <div 
            className="border p-2"
            dangerouslySetInnerHTML={{ __html: qrCode }}
          />
        )}
      </div>
      {secret && (
        <div className="text-sm">
          <p>Or enter this code manually:</p>
          <code className="bg-muted p-2 rounded">{secret}</code>
        </div>
      )}
      <p className="mt-4">2. Enter the verification code from your app:</p>
    </div>
  );
} 