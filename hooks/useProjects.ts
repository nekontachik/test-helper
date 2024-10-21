import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useSession } from 'next-auth/react';

export function useProjects() {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/api/projects'),
    onError: (error) => {
      console.error('Error fetching projects:', error);
    },
    enabled: status === 'authenticated', // Only run the query if the user is authenticated
  });
}
