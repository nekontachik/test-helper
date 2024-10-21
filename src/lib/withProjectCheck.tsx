import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';
import { useRouter, usePathname } from 'next/navigation';
import { Project } from '@/types';

export function useProjectCheck() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
  });
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) return { isLoading: true };

  if (!data || data.data.length === 0) {
    if (pathname !== '/projects') {
      router.push('/projects');
    }
    return { hasProjects: false };
  }

  return { hasProjects: true };
}
