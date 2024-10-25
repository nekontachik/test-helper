'use client';

import React from 'react';
import { VStack } from '@chakra-ui/react';
import ProjectCard from './ProjectCard';
import type { Project } from '@prisma/client';

type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

interface ExtendedProject extends Project {
  description: string | null;
  status: ProjectStatus;
}

interface ProjectListProps {
  projects: ExtendedProject[];
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  return (
    <VStack spacing={4} align="stretch" data-testid="project-list">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project}
        />
      ))}
    </VStack>
  );
};

export default ProjectList;
