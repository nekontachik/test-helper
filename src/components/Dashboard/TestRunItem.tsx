'use client';

import { useRouter } from 'next/navigation';
import { Flex, Icon, Box, Text, Badge, HStack, Button } from '@chakra-ui/react';
import { FiCheckCircle, FiPlay, FiAlertCircle } from 'react-icons/fi';

interface TestRunItemProps {
  id: string;
  name: string;
  status: string;
  progress: number;
  date: string;
}

export function TestRunItem({ id, name, status, progress, date }: TestRunItemProps): JSX.Element {
  const router = useRouter();
  const statusColor = status === 'completed' ? 'green' : status === 'in_progress' ? 'blue' : 'gray';
  const statusIcon = status === 'completed' ? FiCheckCircle : status === 'in_progress' ? FiPlay : FiAlertCircle;
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Flex 
      justify="space-between" 
      align="center" 
      w="100%" 
      cursor="pointer"
      onClick={() => router.push(`/test-runs/${id}`)}
      _hover={{ bg: 'gray.50' }}
      p={2}
      borderRadius="md"
    >
      <Flex align="center">
        <Icon as={statusIcon} color={`${statusColor}.500`} boxSize={5} mr={3} />
        <Box>
          <Text fontWeight="medium">{name}</Text>
          <Flex align="center">
            <Badge colorScheme={statusColor} mr={2}>
              {status.replace('_', ' ')}
            </Badge>
            <Text fontSize="sm" color="gray.500">Started: {formattedDate}</Text>
          </Flex>
        </Box>
      </Flex>
      <HStack spacing={4}>
        <Text fontWeight="bold">{progress}%</Text>
        <Button size="sm" variant="outline" colorScheme="blue">
          View
        </Button>
      </HStack>
    </Flex>
  );
} 