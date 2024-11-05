import { RegisterForm } from '@/components/auth/RegisterForm';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function RegisterPage() {
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
