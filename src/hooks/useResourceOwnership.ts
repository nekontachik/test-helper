import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface UseResourceOwnershipOptions {
  resourceType: 'project' | 'testCase' | 'testRun';
  resourceId: string;
}

interface OwnershipResult {
  isOwner: boolean | null;
  isTeamMember: boolean | null;
}

export function useResourceOwnership({ resourceType, resourceId }: UseResourceOwnershipOptions): OwnershipResult {
  const { data: session } = useSession();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [isTeamMember, setIsTeamMember] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOwnership = async (): Promise<void> => {
      if (!session?.user) {
        setIsOwner(false);
        setIsTeamMember(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/ownership/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resourceType,
            resourceId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to check ownership');
        }

        const data = await response.json();
        setIsOwner(data.isOwner);
        setIsTeamMember(data.isTeamMember);
      } catch (error) {
        console.error('Ownership check error:', error);
        setIsOwner(false);
        setIsTeamMember(false);
      }
    };

    checkOwnership();
  }, [session, resourceType, resourceId]);

  return { isOwner, isTeamMember };
} 