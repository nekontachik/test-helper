import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import type { Project } from '@prisma/client'

interface ProjectCardProps {
  project: Project
  onClick?: (project: Project) => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={() => onClick?.(project)}
      _hover={{
        boxShadow: onClick ? 'md' : 'none',
      }}
    >
      <VStack align="start" spacing={2}>
        <Heading size="md">{project.name}</Heading>
        {project.description && (
          <Text color="gray.600">{project.description}</Text>
        )}
        <Text fontSize="sm" color="gray.500">
          Created: {new Date(project.createdAt).toLocaleDateString()}
        </Text>
      </VStack>
    </Box>
  )
} 