import React from 'react';
import { Box, Heading, Text, Button, Flex } from '@chakra-ui/react';
import { Project } from '../models/types';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      bg="white"
      shadow="md"
    >
      <Heading as="h3" size="md" mb={2}>
        {project.name}
      </Heading>
      <Text mb={4}>{project.description}</Text>
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="sm" color="gray.500">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </Text>
        <Link href={`/projects/${project.id}`} passHref>
          <Button as="a" colorScheme="blue" size="sm">
            View Details
          </Button>
        </Link>
      </Flex>
    </Box>
  );
};

export default ProjectCard;
