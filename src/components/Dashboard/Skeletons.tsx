'use client';

import React from 'react';
import { Box, Skeleton, SimpleGrid, Card, CardBody, Divider } from '@chakra-ui/react';

export function TestRunsSkeleton(): JSX.Element {
  return (
    <Card>
      <CardBody>
        <Skeleton height="40px" mb={4} />
        <SimpleGrid columns={{ base: 1 }} spacing={4}>
          {[...Array(3)].map((_, i) => (
            <React.Fragment key={i}>
              <Skeleton height="60px" />
              {i < 2 && <Divider />}
            </React.Fragment>
          ))}
        </SimpleGrid>
      </CardBody>
    </Card>
  );
}

export function DashboardSkeleton(): JSX.Element {
  return (
    <Box p={[4, 6, 8]}>
      <Skeleton height="40px" width="300px" mb={2} />
      <Skeleton height="20px" width="200px" mb={8} />
      
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height="100px" borderRadius="lg" />
        ))}
      </SimpleGrid>
      
      <Skeleton height="30px" width="150px" mb={4} />
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height="180px" borderRadius="lg" />
        ))}
      </SimpleGrid>
    </Box>
  );
}

export function ProjectsSkeleton(): JSX.Element {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} height="200px" borderRadius="lg" />
      ))}
    </SimpleGrid>
  );
} 