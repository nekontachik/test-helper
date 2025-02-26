import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TestRunList from './TestRunList';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestRunStatus } from '@/types';

// Mock the API client
jest.mock('@/lib/apiClient', () => ({
  getTestRuns: jest.fn(),
}));

const mockTestRuns = [
  {
    id: '1',
    name: 'Smoke Test Run',
    status: TestRunStatus.COMPLETED,
    projectId: 'project-1',
    createdAt: new Date('2023-01-01').toISOString(),
    updatedAt: new Date('2023-01-02').toISOString(),
    completedAt: new Date('2023-01-02').toISOString(),
    testCaseCount: 5,
    passRate: 80,
  },
  {
    id: '2',
    name: 'Regression Test Run',
    status: TestRunStatus.IN_PROGRESS,
    projectId: 'project-1',
    createdAt: new Date('2023-01-03').toISOString(),
    updatedAt: new Date('2023-01-03').toISOString(),
    completedAt: null,
    testCaseCount: 10,
    passRate: 60,
  },
  {
    id: '3',
    name: 'Performance Test Run',
    status: TestRunStatus.PENDING,
    projectId: 'project-1',
    createdAt: new Date('2023-01-04').toISOString(),
    updatedAt: new Date('2023-01-04').toISOString(),
    completedAt: null,
    testCaseCount: 3,
    passRate: null,
  },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof TestRunList> = {
  title: 'Components/TestRunList',
  component: TestRunList,
  decorators: [
    (Story): React.ReactElement => (
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </ChakraProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TestRunList>;

// Set up mock responses for each story
export const Default: Story = {
  args: {
    projectId: 'project-1',
  },
  parameters: {
    mockData: [
      {
        path: 'getTestRuns',
        response: {
          data: mockTestRuns,
          total: mockTestRuns.length,
          page: 1,
          limit: 10,
          totalPages: 1
        },
      },
    ],
  },
};

export const Loading: Story = {
  args: {
    projectId: 'project-1',
  },
  parameters: {
    mockData: [
      {
        path: 'getTestRuns',
        loading: true,
      },
    ],
  },
};

export const ErrorState: Story = {
  args: {
    projectId: 'project-1',
  },
  parameters: {
    mockData: [
      {
        path: 'getTestRuns',
        error: new Error('Failed to load test runs'),
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    projectId: 'project-1',
  },
  parameters: {
    mockData: [
      {
        path: 'getTestRuns',
        response: {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        },
      },
    ],
  },
};
