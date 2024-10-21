import type { Meta, StoryObj } from '@storybook/react';
import { Page } from './Page';

const meta: Meta<typeof Page> = {
  title: 'Example/Page',
  component: Page,
  // ...other meta properties
};

export default meta;
type Story = StoryObj<typeof Page>;

// Export your stories here
