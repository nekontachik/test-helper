import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';

const meta: Meta<typeof Header> = {
  title: 'Example/Header',
  component: Header,
  // ...other meta properties
};

export default meta;
type Story = StoryObj<typeof Header>;

// Export your stories here
