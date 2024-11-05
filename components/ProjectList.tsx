import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { Box, Flex, VStack } from '@chakra-ui/react';
import { Skeleton } from '@/components/Skeleton';
import type { Project } from '@prisma/client';

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  if (!projects?.length) {
    return (
      <Box textAlign="center" py={8}>
        No projects found
      </Box>
    );
  }

  return (
    <Flex flexWrap="wrap" gap={6}>
      {projects.map((project: Project) => (
        <Box 
          key={project.id}
          flex={{ 
            base: '1 1 100%',
            md: '1 1 calc(50% - 12px)',
            lg: '1 1 calc(33.333% - 16px)'
          }}
        >
          <ProjectCard project={project} />
        </Box>
      ))}
    </Flex>
  );
}

// Loading state component
export function ProjectListSkeleton() {
  return (
    <Flex flexWrap="wrap" gap={6}>
      {[1, 2, 3].map((i) => (
        <Box 
          key={i}
          flex={{ 
            base: '1 1 100%',
            md: '1 1 calc(50% - 12px)',
            lg: '1 1 calc(33.333% - 16px)'
          }}
        >
          <VStack p={6} boxShadow="md" borderRadius="lg" bg="white" spacing={4}>
            <Skeleton height="24px" width="60%" />
            <Skeleton height="16px" width="100%" />
            <Skeleton height="16px" width="40%" />
          </VStack>
        </Box>
      ))}
    </Flex>
  );
}
