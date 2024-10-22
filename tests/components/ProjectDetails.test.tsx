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

// Mock the useProject hook
jest.mock('../../src/hooks/useProject', () => ({
  useProject: jest.fn(() => ({ project: mockProject, isLoading: false, error: null }))
}));

describe('ProjectDetails', () => {
  it('renders project details correctly', () => {
    render(
      <ChakraProvider>
        <ProjectDetails projectId={mockProject.id} />
      </ChakraProvider>
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('This is a test project')).toBeInTheDocument();
  });
});
