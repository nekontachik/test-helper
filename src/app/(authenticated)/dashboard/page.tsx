'use client';

import React, { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Box, SimpleGrid, Text, Button, Icon, Flex, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { logger } from '@/lib/logger';
import { withAuth } from '@/components/withAuth';
import { UserRole } from '@/types/auth';
import { ErrorFactory } from '@/lib/errors/ErrorFactory';
import type { ApiErrorCode, ErrorCode } from '@/lib/errors/types';
import Link from 'next/link';
import { FiRefreshCw, FiPlus, FiFolder, FiFileText, FiPlay, FiBarChart2, FiInfo } from 'react-icons/fi';
import { ErrorDisplay, LoadingState } from '../../dashboard/components';
import type { DashboardProps, DashboardError } from '../../dashboard/types';
import { StatCard } from '@/components/atoms/StatCard';

// Define allowed roles based on updated UserRole type
const ALLOWED_ROLES: UserRole[] = [UserRole.USER, UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER];

function DashboardPage({ onError }: DashboardProps = {}): JSX.Element {
  const { user: _user } = useAuth();
  const [error, setError] = React.useState<DashboardError | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasProjects, setHasProjects] = React.useState(false);
  const [stats, setStats] = React.useState({
    projects: 0,
    testCases: 0,
    testRuns: 0,
    successRate: 0
  });

  const refreshData = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would fetch actual data
      // For now, we'll assume no data exists
      setHasProjects(false);
      setStats({
        projects: 0,
        testCases: 0,
        testRuns: 0,
        successRate: 0
      });
    } catch (err) {
      const error = err instanceof Error ? 
        ErrorFactory.create('API_ERROR' as ErrorCode, err.message) :
        ErrorFactory.create('SYSTEM_ERROR' as ErrorCode, 'An unexpected error occurred');
      
      const errorData: DashboardError = {
        code: error.code as ApiErrorCode,
        message: error.message
      };
      
      setError(errorData);
      if (onError) {
        onError(errorData);
      }
      
      logger.error('Dashboard data refresh failed', { error });
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  const handleRefresh = (): void => {
    setIsLoading(true);
    refreshData();
  };

  return (
    <Box mb={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">Dashboard</Text>
        <Button 
          leftIcon={<FiRefreshCw />} 
          onClick={handleRefresh}
          size="sm"
          colorScheme="blue"
          variant="outline"
        >
          Refresh
        </Button>
      </Flex>

      {!hasProjects && (
        <Alert status="info" mb={6} borderRadius="md">
          <AlertIcon as={FiInfo} />
          <Box>
            <AlertTitle>Welcome to the Test Management Tool!</AlertTitle>
            <AlertDescription>
              Get started by creating your first project. Projects help you organize test cases and runs.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard 
          title="Total Projects" 
          value={stats.projects.toString()} 
          icon={<FiFolder className="h-5 w-5" />}
          emptyState={stats.projects === 0}
        />
        <StatCard 
          title="Test Cases" 
          value={stats.testCases.toString()} 
          icon={<FiFileText className="h-5 w-5" />}
          emptyState={stats.testCases === 0}
        />
        <StatCard 
          title="Test Runs" 
          value={stats.testRuns.toString()} 
          icon={<FiPlay className="h-5 w-5" />}
          emptyState={stats.testRuns === 0}
        />
        <StatCard 
          title="Success Rate" 
          value={stats.successRate > 0 ? `${stats.successRate}%` : "N/A"} 
          icon={<FiBarChart2 className="h-5 w-5" />}
          emptyState={stats.successRate === 0}
        />
      </SimpleGrid>

      <Text fontSize="lg" fontWeight="medium" mb={4}>Quick Actions</Text>
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
            <Icon as={FiPlus} boxSize={6} color="blue.500" mb={2} />
            <Text fontWeight="medium">New Project</Text>
          </Box>
        </Link>
        <Link href={hasProjects ? "/test-cases/new" : "/projects"} style={{ width: '100%' }}>
          <Box
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            textAlign="center"
            cursor="pointer"
            _hover={{ boxShadow: 'md' }}
            opacity={hasProjects ? 1 : 0.7}
          >
            <Icon as={FiFileText} boxSize={6} color={hasProjects ? "green.500" : "gray.400"} mb={2} />
            <Text fontWeight="medium">Create Test Case</Text>
            {!hasProjects && <Text fontSize="xs" color="gray.500">Create a project first</Text>}
          </Box>
        </Link>
        <Link href={hasProjects ? "/test-runs/new" : "/projects"} style={{ width: '100%' }}>
          <Box
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            textAlign="center"
            cursor="pointer"
            _hover={{ boxShadow: 'md' }}
            opacity={hasProjects ? 1 : 0.7}
          >
            <Icon as={FiPlay} boxSize={6} color={hasProjects ? "orange.500" : "gray.400"} mb={2} />
            <Text fontWeight="medium">Start Test Run</Text>
            {!hasProjects && <Text fontSize="xs" color="gray.500">Create a project first</Text>}
          </Box>
        </Link>
        <Link href={hasProjects ? "/reports" : "/projects"} style={{ width: '100%' }}>
          <Box
            p={6}
            bg="white"
            borderRadius="lg"
            boxShadow="sm"
            textAlign="center"
            cursor="pointer"
            _hover={{ boxShadow: 'md' }}
            opacity={hasProjects ? 1 : 0.7}
          >
            <Icon as={FiBarChart2} boxSize={6} color={hasProjects ? "purple.500" : "gray.400"} mb={2} />
            <Text fontWeight="medium">View Reports</Text>
            {!hasProjects && <Text fontSize="xs" color="gray.500">Create a project first</Text>}
          </Box>
        </Link>
      </SimpleGrid>
    </Box>
  );
}

export default withAuth(DashboardPage, ALLOWED_ROLES); 