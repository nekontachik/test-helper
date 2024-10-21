'use client';

import React, { useEffect, useState } from 'react';
import { Heading, VStack, Button, Text } from '@chakra-ui/react';
import ProjectList from '@/components/ProjectList';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { Project, ProjectFormData } from '@/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    }
    fetchProjects();
  }, []);

  const handleCreateProject = async (data: ProjectFormData) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const newProject = await response.json();
      setProjects([...projects, newProject]);
      setIsModalOpen(false);
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      <Heading>Projects</Heading>
      <Button onClick={() => setIsModalOpen(true)} colorScheme="blue">
        Create New Project
      </Button>
      {projects.length > 0 ? (
        <ProjectList projects={projects} />
      ) : (
        <Text>No projects found. Create a new project to get started!</Text>
      )}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </VStack>
  );
}
