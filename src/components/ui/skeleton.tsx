import React from 'react';
import { Box } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';

export const Skeleton = (props: BoxProps): React.ReactElement => {
  return <Box bg="gray.200" {...props} />;
};
