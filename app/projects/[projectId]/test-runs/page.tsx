'use client';

import { useParams } from 'next/navigation';
import { Box, Heading, Button, VStack } from '@chakra-ui/react';
import TestRunList from '@/components/TestRunList';
import NextLink from 'next/link';

export default function TestRunsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  if (!projectId) {
    return <Box>Error: Project ID not found</Box>;
  }

  return (
    <Box p={4}>
      <Heading as="h1" mb={4}>
        Test Runs
      </Heading>
      <VStack spacing={4} align="stretch">
        <NextLink
          href={`/projects/${projectId}/test-runs/new`}
          passHref
          legacyBehavior
        >
          <Button as="a" colorScheme="green">
            Create New Test Run
          </Button>
        </NextLink>
        <TestRunList projectId={projectId} />
      </VStack>
    </Box>
  );
}
