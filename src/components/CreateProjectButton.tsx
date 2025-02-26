'use client';

import React, { useState } from 'react';
import { Button } from '@chakra-ui/react';
import { CreateProjectModal } from './CreateProjectModal';
import { useCreateProject } from '@/hooks/useProjects';
import type { ProjectFormData } from '@/types';

export function CreateProjectButton(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: createProject } = useCreateProject();

  const handleCreateProject = async (data: ProjectFormData): Promise<void> => {
    try {
      await createProject(data);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      // You might want to show an error toast here
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Create Project</Button>
      <CreateProjectModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </>
  );
}
