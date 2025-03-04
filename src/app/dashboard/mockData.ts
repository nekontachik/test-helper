import { 
  FiFolder, 
  FiFileText, 
  FiCheckCircle, 
  FiAlertCircle,
  FiPlus,
  FiPlay,
  FiBarChart2
} from 'react-icons/fi';
import { UserRole } from '@/types/auth';
import type { StatData, QuickAction, ProjectData } from './types';

// Mock stats data
export const mockStats: StatData[] = [
  { title: 'Total Projects', stat: 12, icon: FiFolder, colorScheme: 'blue' },
  { title: 'Total Test Cases', stat: 248, icon: FiFileText, colorScheme: 'purple' },
  { title: 'Passed Tests', stat: '86%', icon: FiCheckCircle, colorScheme: 'green', helpText: '214 of 248 tests' },
  { title: 'Failed Tests', stat: '14%', icon: FiAlertCircle, colorScheme: 'red', helpText: '34 of 248 tests' },
];

// Mock projects data
export const mockProjects: ProjectData[] = [
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

// Mock quick actions
export const quickActions: QuickAction[] = [
  { 
    label: 'New Project', 
    icon: FiPlus, 
    href: '/projects/new', 
    colorScheme: 'blue',
    requiredRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER]
  },
  { 
    label: 'Create Test Case', 
    icon: FiFileText, 
    href: '/test-cases/new', 
    colorScheme: 'purple' 
  },
  { 
    label: 'Start Test Run', 
    icon: FiPlay, 
    href: '/test-runs/new', 
    colorScheme: 'green' 
  },
  { 
    label: 'View Reports', 
    icon: FiBarChart2, 
    href: '/reports', 
    colorScheme: 'orange',
    requiredRoles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.TESTER]
  },
]; 