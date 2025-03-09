import React from 'react';
import type { Project } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Flex } from '@/components/ui/flex';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = React.memo(({ project }) => {
  const getStatusVariant = (status: Project['status']): "success" | "info" | "inactive" | "default" => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'ARCHIVED':
        return 'inactive';
      default:
        return 'default';
    }
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <Flex justify="between" align="center">
          <Heading size="lg">{project.name}</Heading>
          <Badge variant={getStatusVariant(project.status)}>
            {project.status}
          </Badge>
        </Flex>
      </CardHeader>
      <CardContent className="pb-2">
        <Text>{project.description}</Text>
      </CardContent>
      <CardFooter>
        <Text size="sm" color="muted">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </Text>
      </CardFooter>
    </Card>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;
