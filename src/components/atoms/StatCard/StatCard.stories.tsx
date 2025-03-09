import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './index';
import { FiUsers, FiFileText, FiCheckCircle } from 'react-icons/fi';

const meta: Meta<typeof StatCard> = {
  title: 'Atoms/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Users: Story = {
  args: {
    title: 'Total Users',
    value: '1,234',
    subtext: '12% increase from last month',
    icon: <FiUsers className="h-5 w-5" />,
  },
};

export const Documents: Story = {
  args: {
    title: 'Documents',
    value: '567',
    icon: <FiFileText className="h-5 w-5" />,
  },
};

export const CompletedTasks: Story = {
  args: {
    title: 'Completed Tasks',
    value: '89%',
    subtext: '5% increase from last week',
    icon: <FiCheckCircle className="h-5 w-5" />,
  },
}; 