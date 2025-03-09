import React from 'react';
import { Box, Flex, Button, IconButton } from '@chakra-ui/react';
import NextLink from 'next/link';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useLayout } from '@/contexts/LayoutContext';

interface NavbarProps {
  hasProjects: boolean;
}

export default function Navbar({ hasProjects = false }: NavbarProps): JSX.Element {
  const { toggleSidebar } = useLayout();

  return (
    <Box 
      position="fixed"
      top="0"
      left="0"
      right="0"
      height="var(--navbar-height, 60px)"
      zIndex="1000"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      boxShadow="md"
      width="100%"
      display="block"
    >
      <Flex
        maxW="container.xl"
        mx="auto"
        align="center"
        justify="space-between"
        height="100%"
        px={4}
      >
        <Flex align="center">
          <IconButton
            aria-label="Toggle sidebar"
            icon={<HamburgerIcon />}
            variant="ghost"
            onClick={toggleSidebar}
            mr={2}
            display={{ base: 'flex', md: 'none' }}
          />
          <NextLink href="/" passHref legacyBehavior>
            <Button as="a" variant="ghost" fontWeight="bold">
              Test Management Tool
            </Button>
          </NextLink>
        </Flex>
        <Flex>
          <NextLink href="/dashboard" passHref legacyBehavior>
            <Button as="a" variant="ghost" mr={2}>
              Dashboard
            </Button>
          </NextLink>
          <NextLink href="/projects" passHref legacyBehavior>
            <Button as="a" variant="ghost" mr={2}>
              Projects
            </Button>
          </NextLink>
          {hasProjects && (
            <>
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
