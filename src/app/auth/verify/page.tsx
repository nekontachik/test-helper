import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { EmailVerification } from '@/components/EmailVerification';
import { dbLogger as logger } from '@/lib/logger';

export default async function VerifyPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    logger.info('User not authenticated, redirecting to login');
    redirect('/auth/signin');
  }

  if (!session.user.email) {
    logger.info('Email required, redirecting to login');
    redirect('/auth/signin?error=EmailRequired');
  }

  if (session.user.emailVerified) {
    logger.info('Email already verified, redirecting to dashboard');
    redirect('/dashboard');
  }

  return (
    <div className="container max-w-lg py-8">
      <EmailVerification 
        email={session.user.email}
        resendUrl="/api/auth/verify-email/resend"
      />
    </div>
  );
}
