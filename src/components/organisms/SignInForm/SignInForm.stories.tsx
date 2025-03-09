import type { Meta, StoryObj } from '@storybook/react';
import { SignInForm } from './index';

const meta: Meta<typeof SignInForm> = {
  title: 'Organisms/SignInForm',
  component: SignInForm,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SignInForm>;

export const Default: Story = {}; 