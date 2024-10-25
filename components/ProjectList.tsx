import React from 'react';
import { Box, VStack, Text, Heading } from '@chakra-ui/react';
import Link from 'next/link';
import type { Project as PrismaProject } from '@prisma/client';

interface Project extends PrismaProject {
  description?: string | null;
  status?: string;
}

interface ProjectListProps {
  projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h2" size="lg">Your Projects</Heading>
      {projects.length === 0 ? (
        <Text>No projects found. Create a new project to get started.</Text>
      ) : (
        projects.map((project) => (
          <Box key={project.id} p={4} borderWidth={1} borderRadius="md">
            <Link href={`/projects/${project.id}`}>
              <Heading as="h3" size="md">{project.name}</Heading>
            </Link>
            {project.description && <Text>{project.description}</Text>}
          </Box>
        ))
      )}
    </VStack>
  );
};

export default ProjectList;
