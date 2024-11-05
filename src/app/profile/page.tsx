import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ProfileManagement } from '@/components/profile/ProfileManagement';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <ProfileManagement 
      user={session.user}
      currentSessionId={session.id}
    />
  );
} 