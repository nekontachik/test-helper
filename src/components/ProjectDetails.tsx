import React from 'react';
import { Box, Text, Spinner } from '@chakra-ui/react';
import { useProject } from '@/hooks/useProject';

interface ProjectDetailsProps {
  projectId: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId }) => {
  const { data: project, isLoading, error } = useProject(projectId);

  if (isLoading) return <Spinner />;
  if (error)
    return (
      <Text color="red.500">
        Error loading project details: {error.message}
      </Text>
    );
  if (!project) return <Text>Project not found.</Text>;

  return (
    <Box>
      <Text>Name: {project.name}</Text>
      <Text>Description: {project.description}</Text>
      {/* Add more project details as needed */}
    </Box>
  );
};

export default ProjectDetails;
