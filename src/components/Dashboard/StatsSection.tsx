'use client';

import { SimpleGrid } from '@chakra-ui/react';
import { FiFileText, FiClock, FiFolder, FiUser } from 'react-icons/fi';
import { StatCard } from './StatCard';
import type { Session } from 'next-auth';

interface StatsSectionProps {
  testCaseCount: number;
  testRunsCount: number;
  projectsCount: number;
  session: Session | null;
  status: string;
  isLoadingTestRuns: boolean;
  isLoadingProjects: boolean;
}

export function StatsSection({
  testCaseCount,
  testRunsCount,
  projectsCount,
  session,
  status,
  isLoadingTestRuns,
  isLoadingProjects
}: StatsSectionProps): JSX.Element {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
      <StatCard 
        icon={FiFileText} 
        title="Test Cases" 
        stat={testCaseCount} 
        colorScheme="blue"
        isLoading={isLoadingProjects}
      />
      <StatCard 
        icon={FiFolder} 
        title="Projects" 
        stat={projectsCount} 
        colorScheme="purple"
        isLoading={isLoadingProjects}
      />
      <StatCard 
        icon={FiClock} 
        title="Test Runs" 
        stat={testRunsCount} 
        colorScheme="green"
        isLoading={isLoadingTestRuns}
      />
      <StatCard 
        icon={FiUser} 
        title="Role" 
        stat={session?.user?.role || 'User'} 
        colorScheme="orange"
        isLoading={status !== 'authenticated'}
      />
    </SimpleGrid>
  );
} 