'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { useTestRunsData } from '@/hooks/useTestRunsData'; 
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types/testRuns';
import type { TestRun } from '@/types/testRuns';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  Icon,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
} from '@chakra-ui/react';
import { FiFileText, FiClock, FiPlus, FiFolder, FiUser, FiPlay, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { StatCard } from '@/components/Dashboard/StatCard';

// Extend the Project type with the properties we need
interface ProjectWithCounts extends Project {
  testCaseCount: number;
  testRunCount: number;
}

export default function Dashboard(): JSX.Element {
  const { data: session, status } = useSession();
  const { data: projects, isLoading: isLoadingProjects, error: projectsError } = useProjects();
  const { testRuns, isLoading: isLoadingTestRuns, error: testRunsError, fetchAllTestRuns } = useTestRunsData();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingTestRun, setIsCreatingTestRun] = useState(false);
  const router = useRouter();
  
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  // Fetch test runs data when component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      fetchAllTestRuns();
    }
  }, [status, fetchAllTestRuns]);

  // Handle loading state
  if (status === 'loading') {
    return <DashboardSkeleton />;
  }

  // Handle authentication
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return <Box p={8}>Redirecting to sign in...</Box>;
  }

  // Handle projects loading error
  if (projectsError) {
    return (
      <Box p={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <AlertTitle mr={2}>Error loading projects</AlertTitle>
          <AlertDescription>{projectsError.message || 'Please try again later'}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  // Count in-progress and completed test runs
  const testRunsInProgress = testRuns?.filter(run => run.status === 'in_progress') || [];
  const testRunsCompleted = testRuns?.filter(run => run.status === 'completed') || [];

  const handleCreateProject = (): void => {
    setIsCreatingProject(true);
    router.push('/projects/new');
  };

  const handleCreateTestRun = (): void => {
    setIsCreatingTestRun(true);
    router.push('/test-runs/new');
  };

  const handleViewAllTestRuns = (): void => {
    router.push('/test-runs');
  };

  // Calculate test case count from projects
  const testCaseCount = projects?.reduce((acc: number, project: Project) => {
    const projectWithCounts = project as ProjectWithCounts;
    return acc + (projectWithCounts.testCaseCount || 0);
  }, 0) || 0;

  return (
    <Box p={[4, 6, 8]} maxW="1400px" mx="auto">
      <Flex 
        justify="space-between" 
        align="center" 
        mb={8} 
        flexWrap="wrap" 
        gap={4}
      >
        <Box>
          <Heading size="xl" mb={2}>Dashboard</Heading>
          <Text color="gray.500">Welcome back, {session?.user?.name || 'User'}</Text>
        </Box>
        <HStack spacing={4}>
          <Button 
            leftIcon={<FiPlus />} 
            colorScheme="blue" 
            onClick={handleCreateProject}
            isLoading={isCreatingProject}
            size="md"
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
            transition="all 0.2s"
          >
            New Project
          </Button>
          <Button
            leftIcon={<FiPlay />}
            colorScheme="teal"
            onClick={handleCreateTestRun}
            isLoading={isCreatingTestRun}
            size="md"
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
            transition="all 0.2s"
          >
            New Test Run
          </Button>
        </HStack>
      </Flex>

      {/* Stats Section */}
      <SimpleGrid 
        columns={{ base: 1, sm: 2, md: 4 }} 
        spacing={6} 
        mb={8}
      >
        <StatCard 
          icon={FiFolder} 
          title="Total Projects" 
          stat={projects?.length || 0} 
          colorScheme="blue"
          isLoading={isLoadingProjects}
        />
        <StatCard 
          icon={FiFileText} 
          title="Test Cases" 
          stat={testCaseCount} 
          colorScheme="purple"
          isLoading={isLoadingProjects}
        />
        <StatCard 
          icon={FiClock} 
          title="Test Runs" 
          stat={testRuns?.length || 0} 
          colorScheme="green"
          isLoading={isLoadingTestRuns}
        />
        <StatCard 
          icon={FiUser} 
          title="Role" 
          stat={session?.user?.role || 'User'} 
          colorScheme="orange"
          isLoading={status === 'loading'}
        />
      </SimpleGrid>

      {/* Projects Section */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Recent Projects</Heading>
          <Link href="/projects" passHref>
            <Button 
              size="sm" 
              variant="ghost"
              rightIcon={<FiPlus />}
              _hover={{ bg: hoverBgColor }}
            >
              View all
            </Button>
          </Link>
        </Flex>
        {isLoadingProjects ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} height="200px" borderRadius="lg" />
            ))}
          </SimpleGrid>
        ) : projects && projects.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {projects.slice(0, 3).map((project: Project) => (
              <Card 
                key={project.id} 
                borderColor={borderColor} 
                borderWidth="1px"
                bg={bgColor}
                _hover={{ 
                  transform: 'translateY(-4px)',
                  shadow: 'lg',
                  borderColor: 'blue.200'
                }}
                transition="all 0.2s"
              >
                <CardHeader pb={0}>
                  <Heading size="md" mb={1} noOfLines={1}>{project.name}</Heading>
                  <Badge 
                    colorScheme={project.status.toLowerCase() === 'active' ? 'green' : 'gray'}
                    variant="subtle"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {project.status}
                  </Badge>
                </CardHeader>
                <CardBody>
                  <Text 
                    noOfLines={2} 
                    mb={4} 
                    color="gray.600"
                    fontSize="sm"
                  >
                    {project.description}
                  </Text>
                  <Flex justify="space-between" flexWrap="wrap" gap={2}>
                    <HStack spacing={2}>
                      <Icon as={FiFileText} color="blue.500" />
                      <Text fontSize="sm">{(project as ProjectWithCounts).testCaseCount || 0} Test Cases</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Icon as={FiClock} color="green.500" />
                      <Text fontSize="sm">{(project as ProjectWithCounts).testRunCount || 0} Test Runs</Text>
                    </HStack>
                  </Flex>
                  <Button 
                    mt={4} 
                    w="full" 
                    colorScheme="blue" 
                    variant="outline"
                    onClick={() => router.push(`/projects/${project.id}`)}
                    _hover={{
                      bg: 'blue.50',
                      color: 'blue.600'
                    }}
                  >
                    View Project
                  </Button>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Card 
            borderColor={borderColor} 
            borderWidth="1px" 
            borderRadius="lg"
            bg={bgColor}
          >
            <CardBody textAlign="center" py={8}>
              <Icon as={FiFolder} w={12} h={12} color="gray.400" mb={4} />
              <Text mb={4} color="gray.600">No projects found.</Text>
              <Button 
                colorScheme="blue" 
                onClick={handleCreateProject}
                leftIcon={<FiPlus />}
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                transition="all 0.2s"
              >
                Create your first project
              </Button>
            </CardBody>
          </Card>
        )}
      </Box>

      {/* Test Runs Section */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Recent Test Runs</Heading>
          <HStack spacing={2}>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleViewAllTestRuns}
            >
              View all
            </Button>
          </HStack>
        </Flex>
        {isLoadingTestRuns ? (
          <TestRunsSkeleton />
        ) : testRunsError ? (
          <Card borderColor={borderColor} borderWidth="1px" borderRadius="lg">
            <CardBody>
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertTitle mr={2}>Error loading test runs</AlertTitle>
                <AlertDescription>{testRunsError}</AlertDescription>
              </Alert>
            </CardBody>
          </Card>
        ) : testRuns && testRuns.length > 0 ? (
          <Card borderColor={borderColor} borderWidth="1px" borderRadius="lg">
            <CardBody>
              <Tabs variant="enclosed" colorScheme="blue" size="sm">
                <TabList>
                  <Tab>In Progress ({testRunsInProgress.length})</Tab>
                  <Tab>Completed ({testRunsCompleted.length})</Tab>
                  <Tab>All ({testRuns.length})</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0} pt={4}>
                    {testRunsInProgress.length > 0 ? (
                      <SimpleGrid columns={{ base: 1 }} spacing={4}>
                        {testRunsInProgress.slice(0, 3).map((testRun: TestRun, index: number) => (
                          <React.Fragment key={testRun.id}>
                            <TestRunItem 
                              id={testRun.id} 
                              name={testRun.name} 
                              status={testRun.status} 
                              progress={testRun.progress} 
                              date={testRun.startDate}
                            />
                            {index < testRunsInProgress.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </SimpleGrid>
                    ) : (
                      <Box textAlign="center" py={4}>
                        <Text color="gray.500">No in-progress test runs</Text>
                      </Box>
                    )}
                  </TabPanel>
                  <TabPanel px={0} pt={4}>
                    {testRunsCompleted.length > 0 ? (
                      <SimpleGrid columns={{ base: 1 }} spacing={4}>
                        {testRunsCompleted.slice(0, 3).map((testRun: TestRun, index: number) => (
                          <React.Fragment key={testRun.id}>
                            <TestRunItem 
                              id={testRun.id} 
                              name={testRun.name} 
                              status={testRun.status} 
                              progress={testRun.progress} 
                              date={testRun.startDate}
                            />
                            {index < testRunsCompleted.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </SimpleGrid>
                    ) : (
                      <Box textAlign="center" py={4}>
                        <Text color="gray.500">No completed test runs</Text>
                      </Box>
                    )}
                  </TabPanel>
                  <TabPanel px={0} pt={4}>
                    <SimpleGrid columns={{ base: 1 }} spacing={4}>
                      {testRuns.slice(0, 4).map((testRun: TestRun, index: number) => (
                        <React.Fragment key={testRun.id}>
                          <TestRunItem 
                            id={testRun.id} 
                            name={testRun.name} 
                            status={testRun.status} 
                            progress={testRun.progress} 
                            date={testRun.startDate}
                          />
                          {index < Math.min(testRuns.length, 4) - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </SimpleGrid>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        ) : (
          <Card borderColor={borderColor} borderWidth="1px" borderRadius="lg">
            <CardBody textAlign="center">
              <Text mb={4}>No test runs found.</Text>
              <Button colorScheme="teal" onClick={handleCreateTestRun}>
                Create your first test run
              </Button>
            </CardBody>
          </Card>
        )}
      </Box>

      {/* Quick Links Section */}
      <Box>
        <Heading size="md" mb={4}>Quick Links</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <QuickLinkCard 
            title="Test Cases" 
            description="Manage all your test cases"
            href="/test-cases"
            icon={FiFileText}
          />
          <QuickLinkCard 
            title="Test Runs" 
            description="View and create test runs"
            href="/test-runs"
            icon={FiClock}
          />
          <QuickLinkCard 
            title="Settings" 
            description="Manage your account settings"
            href="/settings"
            icon={FiUser}
          />
        </SimpleGrid>
      </Box>
    </Box>
  );
}

function QuickLinkCard({ title, description, href, icon }: { 
  title: string; 
  description: string; 
  href: string; 
  icon: IconType
}): JSX.Element {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card 
      as={Link}
      href={href}
      bg={cardBg} 
      borderWidth="1px" 
      borderColor={borderColor} 
      borderRadius="lg"
      _hover={{ 
        transform: 'translateY(-4px)', 
        shadow: 'md', 
        borderColor: 'blue.400' 
      }}
      transition="all 0.2s"
    >
      <CardBody>
        <Flex align="center" mb={2}>
          <Icon as={icon} boxSize={5} color="blue.500" mr={2} />
          <Heading size="sm">{title}</Heading>
        </Flex>
        <Text fontSize="sm" color="gray.500">{description}</Text>
      </CardBody>
    </Card>
  );
}

function TestRunItem({ id, name, status, progress, date }: { 
  id: string; 
  name: string; 
  status: string; 
  progress: number; 
  date: string;
}): JSX.Element {
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

function TestRunsSkeleton(): JSX.Element {
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

function DashboardSkeleton(): JSX.Element {
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

// Unused but kept for reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ProjectsSkeleton(): JSX.Element {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} height="200px" borderRadius="lg" />
      ))}
    </SimpleGrid>
  );
}
