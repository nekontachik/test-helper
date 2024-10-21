import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { TestCaseDetails } from './TestCaseDetails';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';

export default {
  title: 'Components/TestCaseDetails',
  component: TestCaseDetails,
} as Meta<typeof TestCaseDetails>;

const Template: StoryFn<typeof TestCaseDetails> = (args) => (
  <TestCaseDetails {...args} />
);

const mockTestCase: TestCase = {
  id: '1',
  title: 'Test Case 1',
  description: 'This is a test case',
  status: TestCaseStatus.ACTIVE,
  priority: TestCasePriority.HIGH,
  expectedResult: 'Expected result',
  projectId: 'project1',
  version: 1,
  createdAt: '2023-01-01T00:00:00Z', // Changed to ISO string format
  updatedAt: '2023-01-02T00:00:00Z', // Changed to ISO string format
};

export const Default = Template.bind({});
Default.args = {
  testCase: mockTestCase,
};
