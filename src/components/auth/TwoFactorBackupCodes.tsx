'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';

interface TwoFactorBackupCodesProps {
  codes: string[];
  onComplete: () => void;
}

export function TwoFactorBackupCodes({
  codes,
  onComplete,
}: TwoFactorBackupCodesProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCodes = () => {
    const blob = new Blob([codes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={downloadCodes}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        <Button
          onClick={onComplete}
          className="w-full"
        >
          I've saved these codes
        </Button>
      </CardContent>
    </Card>
  );
} 