import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { ProjectList } from '../../components/ProjectList';
import { Project } from '../../models/types';

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Project 1',
    title: 'Title 1',
    description: 'Description 1',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user1',
  },
  {
    id: '2',
    name: 'Project 2',
    title: 'Title 2',
    description: 'Description 2',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user2',
  },
];

describe('ProjectList', () => {
  it('renders projects correctly', () => {
    render(
      <ChakraProvider>
        <ProjectList projects={mockProjects} />
      </ChakraProvider>
    );

    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('displays a message when there are no projects', () => {
    render(
      <ChakraProvider>
        <ProjectList projects={[]} />
      </ChakraProvider>
    );

    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  it('renders create new project button', () => {
    render(
      <ChakraProvider>
        <ProjectList projects={mockProjects} />
      </ChakraProvider>
    );

    expect(screen.getByText('Create New Project')).toBeInTheDocument();
  });

  it('navigates to project details when a project is clicked', () => {
    const mockPush = jest.fn();
    jest.mock('next/router', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));

    render(
      <ChakraProvider>
        <ProjectList projects={mockProjects} />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText('Project 1'));

    expect(mockPush).toHaveBeenCalledWith('/projects/1');
  });
});
