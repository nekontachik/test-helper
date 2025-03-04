'use client';

import { Box, Flex, Heading, Text, HStack, Button } from '@chakra-ui/react';
import { FiPlus, FiPlay } from 'react-icons/fi';
import type { Session } from 'next-auth';

interface DashboardHeaderProps {
  session: Session | null;
  isCreatingProject: boolean;
  isCreatingTestRun: boolean;
  onCreateProject: () => void;
  onCreateTestRun: () => void;
}

export function DashboardHeader({
  session,
  isCreatingProject,
  isCreatingTestRun,
  onCreateProject,
  onCreateTestRun
}: DashboardHeaderProps): JSX.Element {
  return (
    <Flex 
      justify="space-between" 
      align="center" 
      mb={8} 
      flexWrap="wrap" 
      gap={4}
    >
      <Box>
        <Heading size="xl" mb={2}>Dashboard</Heading>
        <Text color="gray.500">Welcome back, {session?.user?.name || 'User'}</Text>
      </Box>
      <HStack spacing={4}>
        <Button 
          leftIcon={<FiPlus />} 
          colorScheme="blue" 
          onClick={onCreateProject}
          isLoading={isCreatingProject}
          size="md"
          _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
          transition="all 0.2s"
        >
          New Project
        </Button>
        <Button
          leftIcon={<FiPlay />}
          colorScheme="teal"
          onClick={onCreateTestRun}
          isLoading={isCreatingTestRun}
          size="md"
          _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
          transition="all 0.2s"
        >
          New Test Run
        </Button>
      </HStack>
    </Flex>
  );
} 