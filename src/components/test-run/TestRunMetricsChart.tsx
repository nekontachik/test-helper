'use client';

import { useMemo } from 'react';
import { Box, Text, Flex, Progress, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import { formatDuration } from '@/utils/formatters';

interface TestRunMetricsChartProps {
  passRate: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  totalCount: number;
  duration: number;
}

export function TestRunMetricsChart({
  passRate,
  passedCount,
  failedCount,
  skippedCount,
  totalCount,
  duration
}: TestRunMetricsChartProps): JSX.Element {
  // Memoize color calculation
  const passRateColor = useMemo(() => {
    if (passRate >= 90) return 'green';
    if (passRate >= 70) return 'yellow';
    return 'red';
  }, [passRate]);
  
  // Format duration for display
  const formattedDuration = useMemo(() => formatDuration(duration), [duration]);
  
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      p={4}
      boxShadow="sm"
      bg="white"
    >
      <Flex direction="column" gap={4}>
        <Stat>
          <StatLabel>Pass Rate</StatLabel>
          <StatNumber>{passRate}%</StatNumber>
          <StatHelpText>{passedCount} of {totalCount} tests passed</StatHelpText>
        </Stat>
        
        <Progress 
          value={passRate} 
          colorScheme={passRateColor}
          size="lg"
          borderRadius="md"
        />
        
        <Flex justify="space-between" mt={2}>
          <Stat>
            <StatLabel>Passed</StatLabel>
            <StatNumber color="green.500">{passedCount}</StatNumber>
          </Stat>
          
          <Stat>
            <StatLabel>Failed</StatLabel>
            <StatNumber color="red.500">{failedCount}</StatNumber>
          </Stat>
          
          <Stat>
            <StatLabel>Skipped</StatLabel>
            <StatNumber color="orange.500">{skippedCount}</StatNumber>
          </Stat>
        </Flex>
        
        <Stat mt={2}>
          <StatLabel>Duration</StatLabel>
          <StatNumber>{formattedDuration}</StatNumber>
        </Stat>
      </Flex>
    </Box>
  );
} 