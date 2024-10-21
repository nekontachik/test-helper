import React from 'react';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/types';

const Dashboard: React.FC = () => {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return <div>Loading projects...</div>;
  if (error) return <div>Error loading projects: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects &&
          projects.map((project: Project) => (
            <div key={project.id} className="border rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex space-x-2">
                <Link
                  href={`/projects/${project.id}/test-cases`}
                  className="text-blue-500 hover:underline"
                >
                  Test Cases
                </Link>
                <Link
                  href={`/projects/${project.id}/test-runs`}
                  className="text-blue-500 hover:underline"
                >
                  Test Runs
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
