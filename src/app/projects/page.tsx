'use client';

import React from 'react';
import { Box, Heading, Button } from '@chakra-ui/react';
import ProjectList from '@/components/ProjectList';
import { useProjects } from '@/hooks/useProjects';
import { withAuth } from '@/components/withAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { UserRole } from '@/types/auth';

function ProjectsPage(): JSX.Element {
  const { data, isLoading, error } = useProjects();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error loading projects: {(error as Error).message}</div>;
  }

  return (
    <Box p={4}>
      <Heading mb={4}>Projects</Heading>
      <Button colorScheme="blue" mb={4}>
        Create New Project
      </Button>
      {data && <ProjectList projects={data.data} />}
    </Box>
  );
}

// Use string literals for roles instead of enum values
export default withAuth(ProjectsPage, [
  'USER',
  'EDITOR',
  'MANAGER',
  'ADMIN'
] as UserRole[]);
