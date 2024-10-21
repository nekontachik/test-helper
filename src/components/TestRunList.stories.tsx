import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import TestRunList from './TestRunList';
import { TestRun, TestRunStatus } from '@/types';

export default {
  title: 'Components/TestRunList',
  component: TestRunList,
  decorators: [(Story) => <div style={{ padding: '3rem' }}><Story /></div>],
} as Meta<typeof TestRunList>;

const Template: StoryFn<React.ComponentProps<typeof TestRunList>> = (args) => (
  <TestRunList {...args} />
);

const mockTestRuns: TestRun[] = [
  {
    id: '1',
    name: 'Test Run 1',
    status: TestRunStatus.COMPLETED,
    projectId: 'project1',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  },
  {
    id: '2',
    name: 'Test Run 2',
    status: TestRunStatus.IN_PROGRESS,
    projectId: 'project1',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-04'),
  },
];

export const Default = Template.bind({});
Default.args = {
  projectId: 'project1',
};

export const Loading = Template.bind({});
Loading.args = {
  projectId: 'project1',
};

export const Error = Template.bind({});
Error.args = {
  projectId: 'project1',
};

// Mock the useTestRuns hook for Storybook
import { useTestRuns } from '@/hooks/useTestRuns';
jest.mock('@/hooks/useTestRuns', () => ({
  useTestRuns: jest.fn(),
}));

Default.parameters = {
  mockData: [
    {
      url: '/api/projects/project1/test-runs',
      method: 'GET',
      status: 200,
      response: {
        data: mockTestRuns,
        totalPages: 1,
        currentPage: 1,
      },
    },
  ],
};

Loading.parameters = {
  mockData: [
    {
      url: '/api/projects/project1/test-runs',
      method: 'GET',
      status: 200,
      response: {
        data: [],
        totalPages: 0,
        currentPage: 1,
      },
      delay: 2000, // Simulate a 2-second delay
    },
  ],
};

Error.parameters = {
  mockData: [
    {
      url: '/api/projects/project1/test-runs',
      method: 'GET',
      status: 500,
      response: { error: 'An error occurred' },
    },
  ],
};
