import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { TestRunForm } from './TestRunForm';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';

export default {
  title: 'Components/TestRunForm',
  component: TestRunForm,
} as Meta<typeof TestRunForm>;

const Template: StoryFn<React.ComponentProps<typeof TestRunForm>> = (args) => (
  <TestRunForm {...args} />
);

const mockTestCases: TestCase[] = [
  {
    id: '1',
    title: 'Test Case 1',
    description: 'Description for Test Case 1',
    expectedResult: 'Expected Result for Test Case 1',
    status: TestCaseStatus.ACTIVE,
    priority: TestCasePriority.HIGH,
    projectId: 'project1',
    version: 1,
    createdAt: '2023-01-01T00:00:00Z', // Use ISO string format
    updatedAt: '2023-01-01T00:00:00Z', // Use ISO string format
  },
  // Add more mock test cases as needed
];

export const Default = Template.bind({});
Default.args = {
  testCases: mockTestCases,
  onSubmit: (data: any) => console.log('Form submitted:', data),
  isSubmitting: false,
  projectId: 'project1',
};

export const Submitting = Template.bind({});
Submitting.args = {
  ...Default.args,
  isSubmitting: true,
};
