import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TwoFactorSetup } from '@/components/TwoFactorSetup';

export default async function TwoFactorSetupPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signup');
  }

  if (session.user.twoFactorEnabled) {
    redirect('/settings/security');
  }

  return (
    <div className="container max-w-lg py-8">
      <TwoFactorSetup
        onComplete="/settings/security"
      />
    </div>
  );
} 