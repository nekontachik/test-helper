import React from 'react';
import { Box, Flex, Button, Text } from '@chakra-ui/react';
import Link from 'next/link';
import Head from 'next/head';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { UserRole } from '@/types/auth';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useSupabaseAuth();
  const userRole = user?.user_metadata?.role as UserRole;

  return (
    <>
      <Head>
        <title>{title ? `${title} | Your App Name` : 'Your App Name'}</title>
      </Head>
      <Box>
        <Flex as="nav" align="center" justify="space-between" wrap="wrap" padding="1.5rem" bg="gray.100" color="black">
          <Flex align="center" mr={5}>
            <Link href="/">
              <Box as="span" fontSize="xl" fontWeight="bold">Test Management App</Box>
            </Link>
          </Flex>

          <Box>
            {user ? (
              <>
                <Text mr={4}>
                  Welcome, {user.user_metadata?.name || user.email} {userRole && `(${userRole})`}
                </Text>
                <Link href="/projects" passHref>
                  <Button as="a" variant="ghost" mr={3}>Projects</Button>
                </Link>
                {userRole === UserRole.ADMIN && (
                  <Link href="/admin" passHref>
                    <Button as="a" variant="ghost" mr={3}>Admin</Button>
                  </Link>
                )}
                <Button onClick={() => logout()}>Sign out</Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" passHref>
                  <Button as="a" mr={3}>Sign in</Button>
                </Link>
                <Link href="/register" passHref>
                  <Button as="a">Register</Button>
                </Link>
              </>
            )}
          </Box>
        </Flex>

        <Box as="main" padding="1.5rem">
          {children}
        </Box>
      </Box>
    </>
  );
};
