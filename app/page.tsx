'use client';

import React, { Suspense } from 'react';
import { Box, Heading, Text, VStack, Button, Flex } from '@chakra-ui/react';
import ProjectList from '@/components/ProjectList';
import { CreateProjectButton } from '@/components/CreateProjectButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary'; // Change this line
import { useSession } from 'next-auth/react';
import { useProjects } from '@/hooks/useProjects';
import { redirect } from 'next/navigation';

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

  return (
    <ErrorBoundary>
      <main>
        <h1>Welcome to Test Management System</h1>
        <p>You are logged in as {session?.user?.email}</p>
        <Suspense fallback={<LoadingSpinner />}>
          {error ? (
            <p>Error loading projects: {error.message}</p>
          ) : (
            <ProjectList projects={projects || []} />
          )}
        </Suspense>
        <CreateProjectButton />
      </main>
    </ErrorBoundary>
  );
}
