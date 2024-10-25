'use client';

import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { ResetPasswordForm } from '@/components/ResetPasswordForm';
import { AuthMessage } from '@/components/AuthMessage';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  if (!token) {
    return (
      <AuthLayout>
        <AuthMessage
          status="error"
          title="Invalid Reset Link"
          message="The password reset link is invalid or has expired. Please request a new one."
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
