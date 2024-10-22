import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { TestRunDetails } from './TestRunDetails';
import {
  TestRun,
  TestRunStatus,
  TestCaseStatus,
  TestCasePriority,
  TestCase,
  TestCaseResult,
  TestCaseResultStatus,
} from '@/types';

export default {
  title: 'Components/TestRunDetails',
  component: TestRunDetails,
} as Meta<typeof TestRunDetails>;

const Template: StoryFn<React.ComponentProps<typeof TestRunDetails>> = (
  args
) => <TestRunDetails {...args} />;

const mockTestCase: TestCase = {
  id: 'tc1',
  title: 'Test Case 1',
  description: 'Description for Test Case 1',
  steps: 'Step 1\nStep 2\nStep 3',
  expectedResult: 'Expected Result 1',
  actualResult: 'Actual Result 1',
  status: TestCaseStatus.ACTIVE,
  priority: TestCasePriority.HIGH,
  projectId: 'project1',
  version: 1,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

const mockTestCaseResult: TestCaseResult = {
  id: '1',
  status: TestCaseResultStatus.PASSED,
  testCaseId: 'tc1',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  notes: 'Test passed successfully',
};

const mockTestRun: TestRun = {
  id: '1',
  name: 'Test Run 1',
  status: TestRunStatus.COMPLETED,
  projectId: 'project1',
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-02T00:00:00Z'),
  testCases: [mockTestCase],
  testCaseResults: [mockTestCaseResult],
};

export const Default = Template.bind({});
Default.args = {
  testRun: mockTestRun,
};
