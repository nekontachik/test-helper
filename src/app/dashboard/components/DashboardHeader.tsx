'use client';

import { Box, Heading, Text, Button, Flex, HStack, Icon } from '@chakra-ui/react';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';

interface DashboardHeaderProps {
  userName: string;
  lastUpdated: Date;
  isRefreshing: boolean;
  canCreateProject: boolean;
  onRefresh: () => void;
  onCreateProject: () => void;
  textColor: string;
}

export const DashboardHeader = ({
  userName,
  lastUpdated,
  isRefreshing,
  canCreateProject,
  onRefresh,
  onCreateProject,
  textColor
}: DashboardHeaderProps): JSX.Element => {
  return (
    <Box mb={6}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading as="h1" size="xl">Dashboard</Heading>
          <Text mt={1} color={textColor}>
            Welcome back, {userName}
          </Text>
        </Box>
        <HStack spacing={4}>
          <Button 
            leftIcon={<Icon as={FiRefreshCw} />} 
            colorScheme="gray" 
            variant="outline"
            size="md"
            isLoading={isRefreshing}
            loadingText="Refreshing..."
            onClick={onRefresh}
          >
            Refresh
          </Button>
          {canCreateProject && (
            <Button 
              leftIcon={<Icon as={FiPlus} />} 
              colorScheme="blue" 
              size="md"
              onClick={onCreateProject}
            >
              New Project
            </Button>
          )}
        </HStack>
      </Flex>
      
      <Text fontSize="sm" color={textColor} mb={6}>
        <Icon as={FiRefreshCw} mr={1} />
        Last updated: {lastUpdated.toLocaleTimeString()}
      </Text>
    </Box>
  );
};

export default DashboardHeader; 