import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TwoFactorVerify } from '@/components/TwoFactorVerify';

export default async function TwoFactorVerifyPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (!session.user.email) {
    redirect('/auth/signin?error=EmailRequired');
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