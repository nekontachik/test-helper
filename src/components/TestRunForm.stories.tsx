import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TestRunForm } from './TestRunForm';
import { TestRunStatus, TestCaseStatus, TestCasePriority } from '@/types';

const meta: Meta<typeof TestRunForm> = {
  title: 'Components/TestRunForm',
  component: TestRunForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TestRunForm>;

export const Default: Story = {
  args: {
    testCases: [],
    projectId: 'project1',
    isSubmitting: false,
    onSubmit: (data) => console.log('Form submitted:', data),
  },
};

export const WithTestCases: Story = {
  args: {
    testCases: [
      {
        id: '1',
        title: 'Test Case 1',
        description: 'Description 1',
        status: TestCaseStatus.ACTIVE,
        priority: TestCasePriority.HIGH,
        projectId: 'project1',
        version: 1,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        expectedResult: 'Expected Result 1',
        steps: 'Step 1\nStep 2',
        actualResult: 'Actual Result 1'
      }
    ],
    projectId: 'project1',
    isSubmitting: false,
    onSubmit: (data) => console.log('Form submitted:', data),
  },
};
