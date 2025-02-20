import type { Meta, StoryObj } from '@storybook/react';
import { TestCaseDetails } from './TestCaseDetails';

const meta: Meta<typeof TestCaseDetails> = {
  title: 'Components/TestCaseDetails',
  component: TestCaseDetails,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TestCaseDetails>;

export default meta;

type Story = StoryObj<typeof TestCaseDetails>;

export const Default: Story = {
  args: {
    testCaseId: '1',
    projectId: 'project1',
  },
};

export const WithDifferentStatus: Story = {
  args: {
    testCaseId: '2',
    projectId: 'project1',
  },
};
