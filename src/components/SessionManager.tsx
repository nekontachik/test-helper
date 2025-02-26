'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  VStack,
  Box,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';
import { AuthCard } from './AuthCard';
import { format } from 'date-fns';

interface Session {
  id: string;
  userAgent: string;
  lastActive: Date;
  isCurrent: boolean;
}

export function SessionManager(): React.ReactElement {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const fetchSessions = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch active sessions',
        status: 'error',
        duration: 5000,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleTerminateSession = async (sessionId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to terminate session');

      toast({
        title: 'Success',
        description: 'Session terminated successfully',
        status: 'success',
        duration: 5000,
      });

      // Refresh sessions list
      fetchSessions();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to terminate session',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateAllSessions = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to terminate all sessions');

      toast({
        title: 'Success',
        description: 'All sessions terminated successfully',
        status: 'success',
        duration: 5000,
      });

      // Refresh sessions list
      fetchSessions();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to terminate all sessions',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Active Sessions">
      <VStack spacing={6} align="stretch" width="100%">
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Device</Th>
                <Th>Last Active</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sessions.map((session) => (
                <Tr key={session.id}>
                  <Td>{session.userAgent}</Td>
                  <Td>{format(new Date(session.lastActive), 'PPpp')}</Td>
                  <Td>
                    {session.isCurrent ? (
                      <Badge colorScheme="green">Current</Badge>
                    ) : (
                      <Badge colorScheme="gray">Active</Badge>
                    )}
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      isDisabled={session.isCurrent}
                      onClick={() => handleTerminateSession(session.id)}
                      isLoading={isLoading}
                    >
                      Terminate
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Button
          colorScheme="red"
          onClick={handleTerminateAllSessions}
          isLoading={isLoading}
        >
          Terminate All Other Sessions
        </Button>
      </VStack>
    </AuthCard>
  );
}
