import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TwoFactorVerify } from '@/components/TwoFactorVerify';

// Set to true to bypass authentication in development
const DEV_MODE = true;

export default async function TwoFactorVerifyPage(): Promise<JSX.Element> {
  // In development mode, bypass authentication and redirect to dashboard
  if (DEV_MODE) {
    redirect('/dashboard');
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (!session.user.email) {
    redirect('/auth/login?error=EmailRequired');
  }

  if (session.user.twoFactorAuthenticated) {
    redirect('/dashboard');
  }

  // Pass the email to the client component
  return (
    <div className="container max-w-lg py-8">
      <TwoFactorVerify
        email={session.user.email}
        onVerifyComplete={() => {}}
      />
    </div>
  );
} 