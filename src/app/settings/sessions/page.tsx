import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionManagement } from '@/components/SessionManagement';

// Set to true to bypass authentication in development
const DEV_MODE = true;

export default async function SessionsPage(): Promise<JSX.Element> {
  // In development mode, bypass authentication
  if (DEV_MODE) {
    const mockSessionToken = 'dev-user@example.com';
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-8">Session Management</h1>
        <SessionManagement currentSessionId={mockSessionToken} />
      </div>
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signup');
  }

  const sessionToken = session.user?.email || 'unknown';

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Session Management</h1>
      <SessionManagement currentSessionId={sessionToken} />
    </div>
  );
} 