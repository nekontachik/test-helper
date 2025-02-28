import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/lib/types/auth';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
): React.FC<P> {
  return function ProtectedRoute(props: P): JSX.Element | null {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
      return <LoadingSpinner />;
    }

    if (!session) {
      router.push("/auth/signin");
      return null;
    }

    if (!session.user) {
      console.error("Session exists but user is null", session);
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
