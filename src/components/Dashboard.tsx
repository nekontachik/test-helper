'use client';

import React, { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTestRunsData } from '@/hooks/useTestRunsData'; 
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Box, useColorModeValue } from '@chakra-ui/react';
import type { Project } from '@/types/testRuns';

import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { StatsSection } from '@/components/Dashboard/StatsSection';
import { ProjectsSection } from '@/components/Dashboard/ProjectsSection';
import { TestRunsSection } from '@/components/Dashboard/TestRunsSection';
import { QuickLinksSection } from '@/components/Dashboard/QuickLinksSection';
import { DashboardSkeleton } from '@/components/Dashboard/Skeletons';

// Extend the Project type with the properties we need
interface ProjectWithCounts extends Project {
  testCaseCount: number;
  testRunCount: number;
}

export default function Dashboard(): JSX.Element {
  const { data: session, status } = useSession();
  const { data: projects, isLoading: isLoadingProjects, error: projectsError } = useProjects();
  const { testRuns, isLoading: isLoadingTestRuns, error: testRunsError, fetchAllTestRuns } = useTestRunsData();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingTestRun, setIsCreatingTestRun] = useState(false);
  const router = useRouter();
  
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  // Fetch test runs data when component mounts
  useEffect(() => {
    fetchAllTestRuns();
  }, [fetchAllTestRuns]);

  const handleCreateProject = (): void => {
    setIsCreatingProject(true);
    router.push('/projects/new');
  };

  const handleCreateTestRun = (): void => {
    setIsCreatingTestRun(true);
    router.push('/test-runs/new');
  };

  // Calculate test case count from projects
  const testCaseCount = projects?.reduce((acc: number, project: Project) => {
    const projectWithCounts = project as ProjectWithCounts;
    return acc + (projectWithCounts.testCaseCount || 0);
  }, 0) || 0;

  if (isLoadingProjects && isLoadingTestRuns && status === 'loading') {
    return <DashboardSkeleton />;
  }

  // Convert testRunsError to Error object if it's a string
  const formattedTestRunsError = testRunsError ? 
    (typeof testRunsError === 'string' ? new Error(testRunsError) : testRunsError as Error) : 
    null;

  return (
    <Box p={[4, 6, 8]} maxW="1400px" mx="auto">
      <DashboardHeader
        session={session}
        isCreatingProject={isCreatingProject}
        isCreatingTestRun={isCreatingTestRun}
        onCreateProject={handleCreateProject}
        onCreateTestRun={handleCreateTestRun}
      />

      <StatsSection
        testCaseCount={testCaseCount}
        testRunsCount={testRuns?.length || 0}
        projectsCount={projects?.length || 0}
        session={session}
        status={status}
        isLoadingTestRuns={isLoadingTestRuns}
        isLoadingProjects={isLoadingProjects}
      />

      <QuickLinksSection />

      <ProjectsSection
        projects={projects as ProjectWithCounts[] | null}
        isLoading={isLoadingProjects}
        error={projectsError}
        borderColor={borderColor}
        bgColor={bgColor}
        hoverBgColor={hoverBgColor}
      />

      <TestRunsSection
        testRuns={testRuns}
        isLoading={isLoadingTestRuns}
        error={formattedTestRunsError}
        viewAllTestRunsUrl="/test-runs"
        borderColor={borderColor}
      />
    </Box>
  );
}

