'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { ProjectsGridSkeleton } from '@/components/ui/skeletons/ProjectCardSkeleton';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  status: 'active' | 'archived' | 'completed';
}

export function ProjectsList(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects(): Promise<void> {
      try {
        // Simulate data refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would be an API call
        // For now, we'll use an empty array to show the empty state
        setProjects([]);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load projects');
        setIsLoading(false);
        console.error('Error fetching projects:', err);
      }
    }

    fetchProjects();
  }, []);

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <CardContent>
          <Text color="danger">{error}</Text>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <ProjectsGridSkeleton />;
  }

  const getStatusVariant = (status: Project['status']): "success" | "info" | "inactive" | "default" => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'archived':
        return 'inactive';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Heading as="h2" size="xl">Your Projects</Heading>
        <Button asChild>
          <Link href="/projects/new">+ New Project</Link>
        </Button>
      </div>
      
      {projects.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent className="pt-6">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <Heading as="h3" size="lg" className="mb-2">No Projects Yet</Heading>
            <Text color="muted" className="mb-6 max-w-md mx-auto">
              Projects help you organize your test cases and test runs. Create your first project to get started.
            </Text>
            <Button asChild size="lg">
              <Link href="/projects/new">Create Your First Project</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id} className="block h-full">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{project.name}</CardTitle>
                    <Badge variant={getStatusVariant(project.status)}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Text color="muted">{project.description}</Text>
                </CardContent>
                <CardFooter>
                  <Text size="xs" color="muted">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </Text>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 