'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Heading, SimpleGrid, Button, Flex, Card, CardBody, Text, Badge, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types/testRuns';

interface ProjectWithCounts extends Project {
  testCaseCount: number;
  testRunCount: number;
}

interface ProjectsSectionProps {
  projects: ProjectWithCounts[] | null;
  isLoading: boolean;
  error: Error | null;
  borderColor: string;
  bgColor: string;
  hoverBgColor: string;
}

export function ProjectsSection({
  projects,
  isLoading,
  error,
  borderColor,
  bgColor,
  hoverBgColor
}: ProjectsSectionProps): JSX.Element {
  const router = useRouter();

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {[...Array(3)].map((_, i) => (
          <Box key={i} height="200px" borderRadius="lg" borderWidth="1px" borderColor={borderColor} />
        ))}
      </SimpleGrid>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <Text color="red.500">Error loading projects: {error.message}</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Box mb={8}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Recent Projects</Heading>
        <Link href="/projects" passHref>
          <Button 
            size="sm" 
            variant="outline"
          >
            View All
          </Button>
        </Link>
      </Flex>

      {projects && projects.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {projects.slice(0, 3).map((project) => (
            <Card 
              key={project.id} 
              borderWidth="1px" 
              borderColor={borderColor}
              bg={bgColor}
              _hover={{ 
                transform: 'translateY(-4px)', 
                shadow: 'md',
                bg: hoverBgColor
              }}
              transition="all 0.2s"
              onClick={() => router.push(`/projects/${project.id}`)}
              cursor="pointer"
            >
              <CardBody>
                <Heading size="md" mb={2}>{project.name}</Heading>
                <Text noOfLines={2} mb={4} fontSize="sm" color="gray.500">
                  {project.description || 'No description provided'}
                </Text>
                <HStack spacing={4}>
                  <Badge colorScheme="blue">
                    {project.testCaseCount} Test Cases
                  </Badge>
                  <Badge colorScheme="green">
                    {project.testRunCount} Runs
                  </Badge>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Card borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Text>No projects found. Create your first project to get started.</Text>
            <Button 
              mt={4} 
              colorScheme="blue" 
              size="sm"
              onClick={() => router.push('/projects/new')}
            >
              Create Project
            </Button>
          </CardBody>
        </Card>
      )}
    </Box>
  );
} 