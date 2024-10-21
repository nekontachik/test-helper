'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VStack, Heading, Spinner, Text } from '@chakra-ui/react';
import EditProjectForm from '@/components/EditProjectForm';
import { useProject } from '@/hooks/useProject';
import { ProjectFormData } from '@/types';

export default function EditProjectPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const router = useRouter();
  const { project, isLoading, error } = useProject(projectId);

  const handleUpdateProject = async (data: ProjectFormData) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.push(`/projects/${projectId}`);
    }
  };

  if (!projectId) return <Text>Project ID not found</Text>;
  if (isLoading) return <Spinner />;
  if (error) return <Text color="red.500">Error: {error.message}</Text>;
  if (!project) return <Text>Project not found</Text>;

  return (
    <VStack spacing={8} align="stretch">
      <Heading>Edit Project: {project.name}</Heading>
      <EditProjectForm
        project={project}
        onUpdateProject={handleUpdateProject}
      />
    </VStack>
  );
}
