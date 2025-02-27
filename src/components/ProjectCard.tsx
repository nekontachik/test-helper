import React from 'react';
import { Box, Heading, Text, Badge, Flex } from '@chakra-ui/react';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = React.memo(({ project }) => {
  const getStatusColor = (status: Project['status']): string => {
    switch (status) {
      case 'ACTIVE':
        return 'green';
      case 'COMPLETED':
        return 'blue';
      case 'ARCHIVED':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md">{project.name}</Heading>
        <Badge colorScheme={getStatusColor(project.status)}>{project.status}</Badge>
      </Flex>
      <Text mt={2}>{project.description}</Text>
      <Text mt={2} fontSize="sm" color="gray.500">
        Created: {new Date(project.createdAt).toLocaleDateString()}
      </Text>
    </Box>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;
