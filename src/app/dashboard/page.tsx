'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Box, 
  Heading, 
  Text, 
  Grid, 
  GridItem, 
  SimpleGrid, 
  Button, 
  Flex, 
  useColorModeValue,
  HStack,
  Icon,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiFolder, 
  FiFileText, 
  FiPlay, 
  FiBarChart2,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiRefreshCw
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import logger from '@/lib/utils/logger';
import { StatCard } from '@/components/Dashboard/StatCard';
import { ProjectCard } from '@/components/Dashboard/ProjectCard';
import { QuickActionButton } from '@/components/Dashboard/QuickActionButton';
import { withAuth } from '@/components/withAuth';
import type { UserRole } from '@/lib/types/auth';
import type { IconType } from 'react-icons';
import { ErrorFactory } from '@/lib/errors/ErrorFactory';
import type { ApiErrorCode, ErrorCode } from '@/lib/errors/types';
import { createErrorMessage } from '@/lib/errors/errorMessages';

// Mock data types
interface StatData {
  title: string;
  stat: number | string;
  icon: IconType;
  colorScheme: string;
  helpText?: string;
}

interface QuickAction {
  label: string;
  icon: IconType;
  href: string;
  colorScheme: string;
}

interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  testCaseCount: number;
  testRunCount: number;
  progress: number;
}

// Mock data with proper typing
const mockStats: StatData[] = [
  { title: 'Total Projects', stat: 12, icon: FiFolder, colorScheme: 'blue' },
  { title: 'Total Test Cases', stat: 248, icon: FiFileText, colorScheme: 'purple' },
  { title: 'Passed Tests', stat: '86%', icon: FiCheckCircle, colorScheme: 'green', helpText: '214 of 248 tests' },
  { title: 'Failed Tests', stat: '14%', icon: FiAlertCircle, colorScheme: 'red', helpText: '34 of 248 tests' },
];

const mockProjects: ProjectData[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Testing suite for the new e-commerce platform including payment processing and inventory management.',
    status: 'ACTIVE',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-02-28'),
    testCaseCount: 120,
    testRunCount: 45,
    progress: 75
  },
  {
    id: '2',
    name: 'Mobile App Testing',
    description: 'Testing of mobile application across Android and iOS platforms',
    status: 'ACTIVE',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-15'),
    testCaseCount: 85,
    testRunCount: 30,
    progress: 60
  },
  {
    id: '3',
    name: 'API Integration Tests',
    description: 'Testing of third-party API integrations and data validation',
    status: 'ACTIVE',
    createdAt: new Date('2023-02-05'),
    updatedAt: new Date('2023-02-10'),
    testCaseCount: 43,
    testRunCount: 15,
    progress: 40
  },
];

const quickActions: QuickAction[] = [
  { label: 'New Project', icon: FiPlus, href: '/projects/new', colorScheme: 'blue' },
  { label: 'Create Test Case', icon: FiFileText, href: '/test-cases/new', colorScheme: 'purple' },
  { label: 'Start Test Run', icon: FiPlay, href: '/test-runs/new', colorScheme: 'green' },
  { label: 'View Reports', icon: FiBarChart2, href: '/reports', colorScheme: 'orange' },
];

// Define allowed roles based on updated UserRole type
const ALLOWED_ROLES: UserRole[] = ['USER', 'ADMIN', 'PROJECT_MANAGER', 'TESTER'];

// Type-safe action handlers
type ActionHandler = (path: string) => void;

interface DashboardError {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
}

interface DashboardProps {
  onNavigate?: ActionHandler;
  onError?: (error: DashboardError) => void;
}

function DashboardPage({ onNavigate, onError }: DashboardProps = {}): JSX.Element {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState<DashboardError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const textColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    logger.debug('Dashboard page mounted');
    return () => {
      logger.debug('Dashboard page unmounted');
    };
  }, []);

  // Loading state
  if (!user) {
    return (
      <Box p={8} textAlign="center">
        <Text>Loading dashboard...</Text>
      </Box>
    );
  }

  const refreshData = async (): Promise<void> => {
    setRefreshing(true);
    setError(null);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
    } catch (err) {
      const error = err instanceof Error ? 
        ErrorFactory.create('API_ERROR' as ErrorCode, err.message) :
        ErrorFactory.create('SYSTEM_ERROR' as ErrorCode, 'An unexpected error occurred');
      
      const errorData = {
        code: error.code,
        message: error.message
      };
      
      setError(errorData);
      onError?.(errorData);
      
      logger.error('Error refreshing dashboard data:', {
        error: error.message,
        code: error.code
      });
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };

  // Role-based access control
  const canCreateProject = user?.role ? ['ADMIN', 'PROJECT_MANAGER'].includes(user.role) : false;

  const handleNavigation: ActionHandler = (path: string): void => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  // Type-safe quick action filtering
  const filteredQuickActions: QuickAction[] = quickActions.filter((action): action is QuickAction => {
    if (!user?.role) return false;
    if (action.href === '/projects/new' && !['ADMIN', 'PROJECT_MANAGER'].includes(user.role)) return false;
    if (action.href === '/reports' && !['ADMIN', 'PROJECT_MANAGER', 'TESTER'].includes(user.role)) return false;
    return true;
  });

  // Add loading state check
  if (isLoading) {
    return (
      <Box p={8}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height="150px" borderRadius="md" />
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  // Update error display with more detailed information
  if (error) {
    const errorDetails = createErrorMessage(error.code, error.message);
    return (
      <Box p={8}>
        <Alert status="error" variant="solid" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>{errorDetails.title}</AlertTitle>
            <AlertDescription>
              {errorDetails.description}
              {errorDetails.action && (
                <Text mt={2} fontSize="sm">
                  Suggested action: {errorDetails.action}
                </Text>
              )}
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={[4, 6, 8]} className="dashboard-container">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading as="h1" size="xl">Dashboard</Heading>
          <Text mt={1} color={textColor}>
            Welcome back, {user?.name || user?.email || 'User'}
          </Text>
        </Box>
        <HStack spacing={4}>
          <Button 
            leftIcon={<FiRefreshCw />} 
            colorScheme="gray" 
            variant="outline"
            size="md"
            isLoading={refreshing}
            loadingText="Refreshing..."
            onClick={refreshData}
          >
            Refresh
          </Button>
          {canCreateProject && (
            <Button 
              leftIcon={<FiPlus />} 
              colorScheme="blue" 
              size="md"
              onClick={() => handleNavigation('/projects/new')}
            >
              New Project
            </Button>
          )}
        </HStack>
      </Flex>
      
      <Text fontSize="sm" color={textColor} mb={6}>
        <Icon as={FiClock} mr={1} />
        Last updated: {lastUpdated.toLocaleTimeString()}
      </Text>
      
      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {mockStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            stat={stat.stat}
            icon={stat.icon}
            helpText={stat.helpText}
            colorScheme={stat.colorScheme}
          />
        ))}
      </SimpleGrid>
      
      {/* Quick Actions with type-safe mapping */}
      <Box mb={10}>
        <Heading as="h2" size="md" mb={4}>Quick Actions</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
          {filteredQuickActions.map((action: QuickAction, index: number) => (
            <QuickActionButton
              key={`${action.label}-${index}`}
              label={action.label}
              icon={action.icon}
              href={action.href}
              colorScheme={action.colorScheme}
            />
          ))}
        </SimpleGrid>
      </Box>
      
      {/* Recent Projects */}
      <Box mb={8}>
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Heading as="h2" size="md">Recent Projects</Heading>
          <Button 
            variant="link" 
            colorScheme="blue" 
            rightIcon={<FiFolder />}
            onClick={() => handleNavigation('/projects')}
          >
            View All
          </Button>
        </Flex>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
          {mockProjects.map((project) => (
            <GridItem key={project.id}>
              <ProjectCard {...project} />
            </GridItem>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}

// Export the wrapped component with proper typing
const WrappedDashboardPage = withAuth<DashboardProps>(DashboardPage, ALLOWED_ROLES);
export default WrappedDashboardPage; 