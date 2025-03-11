import React from 'react';
import { Box, Text } from '@chakra-ui/react';

export const Footer: React.FC = () => {
  return (
    <Box as="footer" width="full" py={4}>
      <Text textAlign="center">
        © 2023 Testing Buddy. All rights reserved.
      </Text>
    </Box>
  );
};
