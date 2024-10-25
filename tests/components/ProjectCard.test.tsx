import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@prisma/client';

type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

interface ExtendedProject extends Project {
  description: string | null;
  status: ProjectStatus;
}

const mockProject: ExtendedProject = {
  id: '1',
  name: 'Test Project',
  description: 'Test Description',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: '1',
  status: 'ACTIVE' as ProjectStatus
};

describe('ProjectCard', () => {
  it('renders project information', () => {
    render(
      <ChakraProvider>
        <ProjectCard project={mockProject} />
      </ChakraProvider>
    );
    
    expect(screen.getByText(mockProject.name)).toBeInTheDocument();
    expect(screen.getByText(mockProject.description!)).toBeInTheDocument();
  });
});
