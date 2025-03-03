'use client';

import { Box, HStack, Text } from '@chakra-ui/react';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import type { TestResult } from '@/types';

interface TestResultItemProps {
  result: TestResult;
}

export function TestResultItem({ result }: TestResultItemProps): JSX.Element {
  return (
    <HStack spacing={4} p={4} borderBottomWidth={1}>
      {result.screenshot && (
        <Box flexShrink={0}>
          <OptimizedImage
            src={result.screenshot}
            alt={`Screenshot for ${result.testCase.title}`}
            width={80}
            height={45}
            priority={false}
          />
        </Box>
      )}
      <Box flex={1}>
        <Text fontWeight="bold">{result.testCase.title}</Text>
        <Text color="gray.500" fontSize="sm">
          {result.notes || 'No notes provided'}
        </Text>
      </Box>
    </HStack>
  );
} 