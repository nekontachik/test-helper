import { RegisterForm } from '@/components/auth/RegisterForm';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

// Set to true to bypass authentication in development
const DEV_MODE = true;

export default async function RegisterPage(): Promise<JSX.Element> {
  // In development mode, bypass authentication and redirect to dashboard
  if (DEV_MODE) {
    redirect('/dashboard');
  }

  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="container max-w-lg py-8">
      <RegisterForm />
    </div>
  );
}
