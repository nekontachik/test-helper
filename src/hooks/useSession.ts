import { useSession as useNextAuthSession } from 'next-auth/react';
import { useCallback } from 'react';

export function useSession() {
  const { data: session, status, update } = useNextAuthSession();

  const invalidateOtherSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to invalidate other sessions');
      }

      return true;
    } catch (error) {
      console.error('Session invalidation error:', error);
      return false;
    }
  }, []);

  const invalidateSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to invalidate session');
      }

      return true;
    } catch (error) {
      console.error('Session invalidation error:', error);
      return false;
    }
  }, []);

  return {
    session,
    status,
    update,
    invalidateOtherSessions,
    invalidateSession,
  };
} 