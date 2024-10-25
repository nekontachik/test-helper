import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/auth';
import { LoadingSpinner } from './LoadingSpinner';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function ProtectedRoute(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
      return <LoadingSpinner />;
    }

    if (!session) {
      router.push("/auth/signin");
      return null;
    }

    if (!allowedRoles.includes(session.user.role)) {
      router.push("/unauthorized");
      return null;
    }

    return <Component {...props} />;
  };
}
