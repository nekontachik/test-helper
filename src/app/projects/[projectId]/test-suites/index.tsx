import React, { Suspense } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Box, Heading, Spinner } from '@chakra-ui/react';
import { Layout } from '@/components/Layout';
import { useTestSuites } from '@/hooks/useTestSuites';

const DynamicTestSuiteList = dynamic(
  () => import('@/components/TestSuiteList').then((mod) => mod.TestSuiteList),
  {
    loading: () => <Spinner />,
    ssr: false,
  }
);

const TestSuitesPage: React.FC = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const { data: testSuites, isLoading } = useTestSuites(projectId as string);

  if (typeof projectId !== 'string') {
    return <div>Invalid project ID</div>;
  }

  // Create a component that only passes the expected props
  const TestSuiteListWrapper = (): JSX.Element => {
    // Only pass the props that TestSuiteList expects
    return (
      <DynamicTestSuiteList
        projectId={projectId}
        testSuites={testSuites || []}
      />
    );
  };

  return (
    <Layout>
      <Box>
        <Heading mb={4}>Test Suites</Heading>
        <Suspense fallback={<Spinner />}>
          {isLoading ? (
            <Spinner />
          ) : (
            <TestSuiteListWrapper />
          )}
        </Suspense>
      </Box>
    </Layout>
  );
};

export default TestSuitesPage;
