import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionManagement } from '@/components/SessionManagement';

export default async function SessionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const sessionToken = session.user?.email || 'unknown';

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Session Management</h1>
      <SessionManagement currentSessionId={sessionToken} />
    </div>
  );
} 