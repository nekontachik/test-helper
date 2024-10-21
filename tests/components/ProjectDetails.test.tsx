import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ProjectDetails from '../../src/components/ProjectDetails';

const mockProject = {
  id: '1',
  name: 'Test Project',
  description: 'This is a test project',
  userId: 'user1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProjectDetails', () => {
  it('renders project details correctly', () => {
    render(
      <ChakraProvider>
        <ProjectDetails project={mockProject} />
      </ChakraProvider>
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('This is a test project')).toBeInTheDocument();
  });
});
