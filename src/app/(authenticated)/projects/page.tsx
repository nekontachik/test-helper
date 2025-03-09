'use client';

import { ProjectsList } from '@/components/projects/ProjectsList';
import { Suspense } from 'react';
import { ProjectsListSkeleton } from '@/components/projects/ProjectsListSkeleton';

export default function ProjectsPage(): JSX.Element {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>
      <Suspense fallback={<ProjectsListSkeleton />}>
        <ProjectsList />
      </Suspense>
    </div>
  );
} 