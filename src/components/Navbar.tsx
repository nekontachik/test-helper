import React from 'react';
import { Box, Flex, Button } from '@chakra-ui/react';
import NextLink from 'next/link';

interface NavbarProps {
  hasProjects: boolean;
}

export default function Navbar({ hasProjects }: NavbarProps): JSX.Element {
  return (
    <Box as="nav" bg="gray.100" py={4}>
      <Flex
        maxW="container.xl"
        mx="auto"
        align="center"
        justify="space-between"
      >
        <NextLink href="/" passHref legacyBehavior>
          <Button as="a" variant="ghost" fontWeight="bold">
            Test Management Tool
          </Button>
        </NextLink>
        <Flex>
          <NextLink href="/dashboard" passHref legacyBehavior>
            <Button as="a" variant="ghost" mr={2}>
              Dashboard
            </Button>
          </NextLink>
          {hasProjects && (
            <>
              <NextLink href="/projects" passHref legacyBehavior>
                <Button as="a" variant="ghost" mr={2}>
                  Projects
                </Button>
              </NextLink>
              <NextLink href="/test-cases" passHref legacyBehavior>
                <Button as="a" variant="ghost" mr={2}>
                  Test Cases
                </Button>
              </NextLink>
              <NextLink href="/test-runs" passHref legacyBehavior>
                <Button as="a" variant="ghost" mr={2}>
                  Test Runs
                </Button>
              </NextLink>
              <NextLink href="/reports" passHref legacyBehavior>
                <Button as="a" variant="ghost">
                  Reports
                </Button>
              </NextLink>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
