'use client';

import React, { useState, useMemo } from 'react';
import { Input, VStack } from '@chakra-ui/react';
import ProjectCard from './ProjectCard';
import { Project } from '@/types';
import styles from './ProjectList.module.css';

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  const [filter, setFilter] = useState('');

  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.name.toLowerCase().includes(filter.toLowerCase()) ||
          (project.description?.toLowerCase().includes(filter.toLowerCase()) ?? false)
      ),
    [projects, filter]
  );

  return (
    <VStack spacing={4} align="stretch">
      <Input
        placeholder="Search projects..."
        value={filter}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFilter(e.target.value)
        }
      />
      <div className={styles.projectGrid}>
        {filteredProjects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={{
              ...project,
              createdAt: new Date(project.createdAt),
              updatedAt: new Date(project.updatedAt),
              description: project.description || 'No description provided'
            }} 
          />
        ))}
      </div>
    </VStack>
  );
}
