'use client';

import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import ProjectDetails from '@/components/ProjectDetails';
import { TestCaseList } from '@/components/TestCaseList';

interface ProjectPageProps {
  params: { projectId: string };
}

export default function ProjectPage({ params }: ProjectPageProps): JSX.Element {
  const { projectId } = params;

  return (
    <Box>
      <Heading mb={6}>Project Details</Heading>
      <ProjectDetails projectId={projectId} />
      <Box mt={8}>
        <TestCaseList projectId={projectId} />
      </Box>
    </Box>
  );
}
