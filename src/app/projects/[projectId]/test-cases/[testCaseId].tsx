import React, { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Box, Spinner, Heading } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { Layout } from '@/components/Layout';
import type { TestCaseFormData} from '@/types';
import { useTestCase } from '@/hooks/useTestCase';
import { useUpdateTestCase } from '@/hooks/useUpdateTestCase';

const DynamicTestCaseForm = dynamic(
  () => import('@/components/TestCaseForm').then((mod) => mod.TestCaseForm),
  {
    loading: () => <Spinner />,
    ssr: false,
  }
);

const TestCasePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const projectId = params?.projectId as string;
  const testCaseId = params?.testCaseId as string;

  const { data: testCase, isLoading, error } = useTestCase(projectId, testCaseId);
  const updateTestCase = useUpdateTestCase(projectId);

  if (!projectId || !testCaseId) {
    return <Box>Invalid project ID or test case ID</Box>;
  }

  if (isLoading) return <Spinner />;
  if (error) return <Box>Error loading test case: {error.message}</Box>;

  if (!testCase) return <Box>Test case not found</Box>;

  const handleSubmit = async (data: TestCaseFormData): Promise<void> => {
    try {
      await updateTestCase.mutateAsync(
        { testCaseId, data },
        {
          onSuccess: () => {
            toast({
              title: 'Test case updated',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            router.push(`/projects/${projectId}/test-cases`);
          },
          onError: (error: Error) => {
            toast({
              title: 'Failed to update test case',
              description: error.message,
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          },
        }
      );
    } catch (error) {
      // Error will be handled by onError callback above
      console.error('Error updating test case:', error);
    }
  };

  return (
    <Layout title="Test Case Details">
      <Heading as="h1" mb={4}>
        Test Case Details
      </Heading>
      <Suspense fallback={<Spinner />}>
        <DynamicTestCaseForm
          testCase={testCase}
          projectId={projectId}
          onSubmit={handleSubmit}
        />
      </Suspense>
    </Layout>
  );
};

export default TestCasePage;
