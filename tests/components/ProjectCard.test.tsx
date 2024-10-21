import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ProjectCard from '@/components/ProjectCard';
import { Project } from '@/types';

const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  description: 'This is a test project',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-02'),
  userId: 'user1',
};

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    render(
      <ChakraProvider>
        <ProjectCard project={mockProject} />
      </ChakraProvider>
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('This is a test project')).toBeInTheDocument();
    expect(screen.getByText('Created: 01/01/2023')).toBeInTheDocument();
  });
});
