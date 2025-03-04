'use client';

import React, { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Box, SimpleGrid, Text, Button, Icon, Flex } from '@chakra-ui/react';
import logger from '@/lib/utils/logger';
import { withAuth } from '@/components/withAuth';
import { UserRole } from '@/types/auth';
import { ErrorFactory } from '@/lib/errors/ErrorFactory';
import type { ApiErrorCode, ErrorCode } from '@/lib/errors/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { FiRefreshCw, FiPlus, FiFolder, FiFileText, FiPlay, FiBarChart2 } from 'react-icons/fi';
import { ErrorDisplay, LoadingState } from './components';
import type { DashboardProps, DashboardError } from './types';

// Define allowed roles based on updated UserRole type
const ALLOWED_ROLES: UserRole[] = [UserRole.USER, UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER];

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: JSX.Element;
}

function StatCard({ title, value, subtext, icon }: StatCardProps): JSX.Element {
  return (
    <Box p={6} bg="white" borderRadius="lg" boxShadow="sm">
      <Flex justify="space-between" align="center" mb={4}>
        <Text color="gray.500" fontSize="sm">
          {title}
        </Text>
        {icon}
      </Flex>
      <Text fontSize="3xl" fontWeight="bold">
        {value}
      </Text>
      {subtext && (
        <Text fontSize="sm" color="gray.500" mt={1}>
          {subtext}
        </Text>
      )}
    </Box>
  );
}

function DashboardPage({ onError }: DashboardProps = {}): JSX.Element {
  const { user } = useAuth();
  const [error, setError] = React.useState<DashboardError | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshData = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      const error = err instanceof Error ? 
        ErrorFactory.create('API_ERROR' as ErrorCode, err.message) :
        ErrorFactory.create('SYSTEM_ERROR' as ErrorCode, 'An unexpected error occurred');
      
      const errorData: DashboardError = {
        code: error.code as ApiErrorCode,
        message: error.message
      };
      
      setError(errorData);
      onError?.(errorData);
      
      logger.error('Error refreshing dashboard data:', {
        error: error.message,
        code: error.code
      });
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    logger.debug('Dashboard page mounted');
    refreshData();
    return () => {
      logger.debug('Dashboard page unmounted');
    };
  }, [refreshData]);

  // Loading state
  if (!user || isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  const handleRefresh = (): void => {
    setIsLoading(true);
    refreshData();
  };

  return (
    <DashboardLayout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold">
            Dashboard
          </Text>
          <Text color="gray.500">
            Welcome back, {user.name || 'User'}
          </Text>
        </Box>
        <Flex gap={4}>
          <Button
            leftIcon={<Icon as={FiRefreshCw} />}
            variant="ghost"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            as={Link}
            href="/projects/new"
            leftIcon={<Icon as={FiPlus} />}
            colorScheme="blue"
          >
            New Project
          </Button>
        </Flex>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          title="Total Projects"
          value="12"
          icon={<Icon as={FiFolder} boxSize={5} color="blue.500" />}
        />
        <StatCard
          title="Total Test Cases"
          value="248"
          icon={<Icon as={FiFileText} boxSize={5} color="purple.500" />}
        />
        <StatCard
          title="Passed Tests"
          value="86%"
          subtext="214 of 248 tests"
          icon={<Icon as={FiPlay} boxSize={5} color="green.500" />}
        />
        <StatCard
          title="Failed Tests"
          value="14%"
          subtext="34 of 248 tests"
          icon={<Icon as={FiPlay} boxSize={5} color="red.500" />}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <Link href="/projects/new" style={{ width: '100%' }}>
          <Box
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            textAlign="center"
            cursor="pointer"
            _hover={{ boxShadow: 'md' }}
          >
            <Icon as={FiPlus} boxSize={6} color="gray.400" mb={2} />
            <Text>New Project</Text>
          </Box>
        </Link>
        <Link href="/test-cases/new" style={{ width: '100%' }}>
          <Box
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            textAlign="center"
            cursor="pointer"
            _hover={{ boxShadow: 'md' }}
          >
            <Icon as={FiFileText} boxSize={6} color="gray.400" mb={2} />
            <Text>Create Test Case</Text>
          </Box>
        </Link>
        <Link href="/test-runs/new" style={{ width: '100%' }}>
          <Box
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            textAlign="center"
            cursor="pointer"
            _hover={{ boxShadow: 'md' }}
          >
            <Icon as={FiPlay} boxSize={6} color="gray.400" mb={2} />
            <Text>Start Test Run</Text>
          </Box>
        </Link>
        <Link href="/reports" style={{ width: '100%' }}>
          <Box
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            textAlign="center"
            cursor="pointer"
            _hover={{ boxShadow: 'md' }}
          >
            <Icon as={FiBarChart2} boxSize={6} color="gray.400" mb={2} />
            <Text>View Reports</Text>
          </Box>
        </Link>
      </SimpleGrid>
    </DashboardLayout>
  );
}

// Export the wrapped component with proper typing
const WrappedDashboardPage = withAuth<DashboardProps>(DashboardPage, ALLOWED_ROLES);
export default WrappedDashboardPage; 