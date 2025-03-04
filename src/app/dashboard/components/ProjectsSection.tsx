'use client';

import { Box, Heading, Grid, GridItem, Button, Flex, Icon } from '@chakra-ui/react';
import { FiFolder } from 'react-icons/fi';
import { ProjectCard } from '@/components/Dashboard/ProjectCard';
import type { ProjectData } from '../types';

interface ProjectsSectionProps {
  projects: ProjectData[];
  onViewAll: () => void;
}

export const ProjectsSection = ({ 
  projects, 
  onViewAll 
}: ProjectsSectionProps): JSX.Element => {
  return (
    <Box mb={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h2" size="md">Recent Projects</Heading>
        <Button 
          variant="link" 
          colorScheme="blue" 
          rightIcon={<Icon as={FiFolder} />}
          onClick={onViewAll}
        >
          View All
        </Button>
      </Flex>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
        {projects.map((project) => (
          <GridItem key={project.id}>
            <ProjectCard {...project} />
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default ProjectsSection; 