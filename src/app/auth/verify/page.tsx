import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { EmailVerification } from '@/components/EmailVerification';

export default async function VerifyPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (!session.user.email) {
    redirect('/auth/login?error=EmailRequired');
  }

  if (session.user.emailVerified) {
    redirect('/dashboard');
  }

  // Server action for resending verification email
  const _handleResendVerification = async (): Promise<void> => {
    'use server';
    
    const response = await fetch('/api/auth/verify-email', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session.user.email }),
    });

    if (!response.ok) {
      throw new Error('Failed to resend verification email');
    }
  };

  return (
    <div className="container max-w-lg py-8">
      <EmailVerification 
        email={session.user.email}
        resendUrl="/api/auth/verify-email/resend"
      />
    </div>
  );
}
