'use client';

import { Box, Heading, SimpleGrid } from '@chakra-ui/react';
import { FiFileText, FiPlay, FiFolder, FiClock } from 'react-icons/fi';
import { QuickLinkCard } from './QuickLinkCard';

export function QuickLinksSection(): JSX.Element {
  return (
    <Box mb={8}>
      <Heading size="md" mb={4}>Quick Links</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <QuickLinkCard
          title="Test Cases"
          description="Create and manage test cases"
          href="/test-cases"
          icon={FiFileText}
        />
        <QuickLinkCard
          title="Projects"
          description="View all your projects"
          href="/projects"
          icon={FiFolder}
        />
        <QuickLinkCard
          title="Test Runs"
          description="View all test runs"
          href="/test-runs"
          icon={FiPlay}
        />
        <QuickLinkCard
          title="History"
          description="View test run history"
          href="/history"
          icon={FiClock}
        />
      </SimpleGrid>
    </Box>
  );
} 