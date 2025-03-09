import { SignUpForm } from '@/components/auth/SignUpForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a new account to get started',
};

export default function RegisterPage(): JSX.Element {
  return <SignUpForm />;
}
