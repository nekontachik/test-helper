import { Box, Heading, Text, HStack, Badge } from '@chakra-ui/react';
import { formatDate, formatDuration } from './utils/formatters';

interface TestRunHeaderProps {
  name: string;
  description?: string | undefined;
  status: string;
  createdBy: {
    name: string;
  };
  createdAt: string;
  startedAt?: string | undefined;
  completedAt?: string | undefined;
  executionTime?: number | undefined;
}

export function TestRunHeader({
  name,
  description,
  status,
  createdBy,
  createdAt,
  startedAt,
  completedAt,
  executionTime
}: TestRunHeaderProps): JSX.Element {
  return (
    <Box>
      <Heading size="lg" mb={2}>{name}</Heading>
      {description && <Text color="gray.600">{description}</Text>}
      
      <HStack mt={4} spacing={6} flexWrap="wrap">
        <Box>
          <Text fontWeight="bold">Status:</Text>
          <Badge colorScheme={status === 'COMPLETED' ? 'green' : status === 'FAILED' ? 'red' : 'blue'}>
            {status}
          </Badge>
        </Box>
        
        <Box>
          <Text fontWeight="bold">Created By:</Text>
          <Text>{createdBy.name}</Text>
        </Box>
        
        <Box>
          <Text fontWeight="bold">Created At:</Text>
          <Text>{formatDate(createdAt)}</Text>
        </Box>
        
        {startedAt && (
          <Box>
            <Text fontWeight="bold">Started At:</Text>
            <Text>{formatDate(startedAt)}</Text>
          </Box>
        )}
        
        {completedAt && (
          <Box>
            <Text fontWeight="bold">Completed At:</Text>
            <Text>{formatDate(completedAt)}</Text>
          </Box>
        )}
        
        {executionTime && (
          <Box>
            <Text fontWeight="bold">Duration:</Text>
            <Text>{formatDuration(executionTime)}</Text>
          </Box>
        )}
      </HStack>
    </Box>
  );
} 