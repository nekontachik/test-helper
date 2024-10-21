import React, { Suspense, useState } from 'react';
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
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const { data: testSuites, isLoading } = useTestSuites(projectId as string);

  if (typeof projectId !== 'string') {
    return <div>Invalid project ID</div>;
  }

  const handleSort = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return (
    <Layout>
      <Box>
        <Heading mb={4}>Test Suites</Heading>
        <Suspense fallback={<Spinner />}>
          {isLoading ? (
            <Spinner />
          ) : (
            <DynamicTestSuiteList
              projectId={projectId}
              testSuites={testSuites || []}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          )}
        </Suspense>
      </Box>
    </Layout>
  );
};

export default TestSuitesPage;
