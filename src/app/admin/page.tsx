'use client';

import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminPage(): JSX.Element | null {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <Text>Loading...</Text>;
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  return (
    <Box>
      <Heading mb={6}>Admin Dashboard</Heading>
      <Text>Welcome to the admin dashboard. Here you can manage users and system settings.</Text>
    </Box>
  );
}
