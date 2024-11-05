'use client';

import { redirect } from 'next/navigation';
import { PasswordResetForm } from '@/components/PasswordResetForm';

interface PageProps {
  searchParams: { token?: string };
}

export default function ResetPasswordPage({ searchParams }: PageProps) {
  if (!searchParams.token) {
    redirect('/auth/reset-password/request');
  }

  return (
    <div className="container max-w-lg py-8">
      <PasswordResetForm token={searchParams.token} />
    </div>
  );
}
