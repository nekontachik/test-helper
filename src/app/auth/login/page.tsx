import { LoginForm } from '@/components/auth/LoginForm';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="container max-w-lg py-8">
      <LoginForm />
    </div>
  );
}
