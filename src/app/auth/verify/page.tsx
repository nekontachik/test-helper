'use client';

import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { AuthVerification } from '@/components/AuthVerification';
import { VerificationStatus } from '@/components/VerificationStatus';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const email = searchParams?.get('email');

  if (!token && !email) {
    return (
      <AuthLayout>
        <div>Invalid verification link</div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {token ? (
        <AuthVerification token={token} />
      ) : (
        <VerificationStatus email={email!} />
      )}
    </AuthLayout>
  );
}
