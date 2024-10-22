import React from 'react';
import { useProject } from '../hooks/useProject';

interface ProjectDetailsProps {
  projectId: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectId }) => {
  const { project, isLoading, error } = useProject(projectId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      {/* Add more project details as needed */}
    </div>
  );
};

export default ProjectDetails;
