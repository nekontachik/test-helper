'use client';

import React, { Suspense } from 'react';
import { Box, Heading, Text, VStack, Button, Flex } from '@chakra-ui/react';
import ProjectList from '@/components/ProjectList';
import { CreateProjectButton } from '@/components/CreateProjectButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useSession } from 'next-auth/react';
import { useProjects } from '@/hooks/useProjects';
import { redirect } from 'next/navigation';
import type { Project as PrismaProject } from '@prisma/client';

type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  status: ProjectStatus;
}

export default function Home() {
  const { data: session, status } = useSession();
  const { data: projects, isLoading, error } = useProjects();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'unauthenticated') {
    redirect('/api/auth/signin');
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const transformedProjects: Project[] = projects?.map((project: any) => ({
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    userId: project.userId,
    status: 'ACTIVE' as ProjectStatus
  })) ?? [];

  return (
    <ErrorBoundary>
      <Box as="main" p={4}>
        <Heading as="h1" mb={4}>Welcome to Test Management System</Heading>
        <Text mb={4}>You are logged in as {session?.user?.email}</Text>
        <Suspense fallback={<LoadingSpinner />}>
          {error ? (
            <Text color="red.500">Error loading projects: {error.message}</Text>
          ) : (
            transformedProjects && <ProjectList projects={transformedProjects} />
          )}
        </Suspense>
        <Box mt={4}>
          <CreateProjectButton />
        </Box>
      </Box>
    </ErrorBoundary>
  );
}
