'use client';

import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Badge, 
  Flex, 
  Button, 
  useColorModeValue,
  HStack,
  Progress
} from '@chakra-ui/react';
import { FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  testCaseCount: number;
  testRunCount: number;
  progress: number;
}

export function ProjectCard({
  id,
  name,
  description,
  status,
  testCaseCount,
  testRunCount,
  progress
}: ProjectCardProps): JSX.Element {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const statusColorScheme = {
    ACTIVE: 'green',
    COMPLETED: 'blue',
    ARCHIVED: 'gray'
  }[status];
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      bg={bgColor}
      p={5}
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
    >
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Heading size="md" mb={2} noOfLines={1}>
            {name}
          </Heading>
          <Badge colorScheme={statusColorScheme} mb={3}>
            {status}
          </Badge>
        </Box>
        <Link href={`/projects/${id}`} passHref>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiExternalLink />}
            colorScheme="blue"
          >
            View
          </Button>
        </Link>
      </Flex>
      
      <Text noOfLines={2} mb={4} color={useColorModeValue('gray.600', 'gray.300')}>
        {description}
      </Text>
      
      <Box mb={4}>
        <Flex justify="space-between" mb={1}>
          <Text fontSize="sm">Progress</Text>
          <Text fontSize="sm" fontWeight="bold">{progress}%</Text>
        </Flex>
        <Progress value={progress} size="sm" colorScheme="blue" borderRadius="full" />
      </Box>
      
      <HStack spacing={4} mt={4}>
        <Box>
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            Test Cases
          </Text>
          <Text fontWeight="bold">{testCaseCount}</Text>
        </Box>
        <Box>
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            Test Runs
          </Text>
          <Text fontWeight="bold">{testRunCount}</Text>
        </Box>
      </HStack>
    </Box>
  );
} 