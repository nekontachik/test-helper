'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Box, Heading, Spinner } from '@chakra-ui/react';
import ProjectDetails from '@/components/ProjectDetails';
import { useProject } from '@/hooks/useProject';

const ProjectPage: React.FC = () => {
  const params = useParams();
  const projectId = params?.projectId as string;

  const { project, isLoading, error } = useProject(projectId);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <Box>Error: {error.message}</Box>;
  }

  if (!project) {
    return <Box>Project not found</Box>;
  }

  return (
    <Box>
      <Heading as="h1" size="xl" mb={6}>
        Project Details
      </Heading>
      <ProjectDetails projectId={projectId} />
    </Box>
  );
};

export default ProjectPage;
