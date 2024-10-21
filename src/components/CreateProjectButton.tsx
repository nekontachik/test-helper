'use client';

import React, { useState } from 'react';
import { Button } from '@chakra-ui/react';
import { CreateProjectModal } from './CreateProjectModal';
import { useCreateProject } from '@/hooks/useProjects';
import { ProjectFormData } from '@/types'; // Import the ProjectFormData type

export function CreateProjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const createProject = useCreateProject();

  const handleCreateProject = async (data: ProjectFormData) => {
    await createProject.mutateAsync(data);
    setIsOpen(false);
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
