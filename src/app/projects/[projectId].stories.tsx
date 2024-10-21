import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import ProjectPage from '../../app/projects/[projectId]/page'; // Updated import path

export default {
  title: 'Pages/ProjectPage',
  component: ProjectPage,
} as Meta;

const Template: StoryFn<typeof ProjectPage> = (args) => <ProjectPage {...args} />;

export const Default = Template.bind({});
Default.args = {
  params: { projectId: 'project-1' },
};

export const WithMockedData = Template.bind({});
WithMockedData.args = {
  params: { projectId: 'project-1' },
};
WithMockedData.parameters = {
  mockData: [
    {
      url: '/api/projects/project-1',
      method: 'GET',
      status: 200,
      response: {
        id: 'project-1',
        name: 'Mocked Project',
        description: 'This is a mocked project for Storybook',
      },
    },
  ],
};
