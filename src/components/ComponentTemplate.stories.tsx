import React from 'react';
import type { StoryFn, Meta } from '@storybook/react';
import { ComponentTemplate } from './ComponentTemplate';

export default {
  title: 'Components/ComponentTemplate',
  component: ComponentTemplate,
} as Meta<typeof ComponentTemplate>;

const Template: StoryFn<typeof ComponentTemplate> = (args) => (
  <ComponentTemplate {...args} />
);

export const Default = Template.bind({});
Default.args = {
  exampleProp: 'Example Value',
};
