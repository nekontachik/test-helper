import React from 'react';
import { useRouter } from 'next/router';
import { useCreateProject } from '../../hooks/useProjects';
import { ProjectForm } from '../../components/ProjectForm';
import { Button } from '@chakra-ui/react';

export default function NewProject() {
  const router = useRouter();
  const createProject = useCreateProject();

  const handleSubmit = async (data: any) => {
    try {
      await createProject.mutateAsync(data);
      router.push('/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div>
      <h1>Create New Project</h1>
      <ProjectForm onSubmit={handleSubmit} />
      <Button
        type="submit"
        colorScheme="blue"
        isLoading={createProject.status === 'pending'}
      >
        Create Project
      </Button>
    </div>
  );
}
