'use client';

import { useParams } from 'next/navigation';
import { Box, Heading, Button, VStack } from '@chakra-ui/react';
import { TestCaseList } from '@/components/TestCaseList';
import NextLink from 'next/link';

export default function TestCasesPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  if (!projectId) {
    return <Box>Error: Project ID not found</Box>;
  }

  return (
    <Box p={4}>
      <Heading as="h1" mb={4}>
        Test Cases
      </Heading>
      <VStack spacing={4} align="stretch">
        <NextLink
          href={`/projects/${projectId}/test-cases/new`}
          passHref
          legacyBehavior
        >
          <Button as="a" colorScheme="blue">
            Create New Test Case
          </Button>
        </NextLink>
        <TestCaseList projectId={projectId} />
      </VStack>
    </Box>
  );
}
