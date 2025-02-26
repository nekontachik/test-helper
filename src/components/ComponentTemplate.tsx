import React from 'react';
import { Box } from '@chakra-ui/react';

interface ComponentTemplateProps {
  // Define your prop types here
  exampleProp: string;
}

export const ComponentTemplate: React.FC<ComponentTemplateProps> = ({
  exampleProp,
}): JSX.Element => {
  return (
    <Box>
      {/* Your component JSX goes here */}
      <p>{exampleProp}</p>
    </Box>
  );
};

ComponentTemplate.defaultProps = {
  // Define default props here
  exampleProp: 'Default value',
};
