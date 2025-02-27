'use client';

import { Button, Flex } from '@chakra-ui/react';
import { RoleGuard } from './RoleGuard';
import { useRole } from '@/hooks/useRole';
import { useCallback } from 'react';
import type { UserRole } from '@/types/auth';

interface ProjectActionsProps {
  projectId: string;
  onEditId?: string;
  onDeleteId?: string;
}

export function ProjectActions({ projectId, onEditId, onDeleteId }: ProjectActionsProps): JSX.Element {
  const { hasRole } = useRole();

  const handleEdit = useCallback((): void => {
    if (onEditId) {
      console.log('Edit project:', onEditId);
    }
  }, [onEditId]);

  const handleDelete = useCallback((): void => {
    if (onDeleteId) {
      console.log('Delete project:', onDeleteId);
    }
  }, [onDeleteId]);

  const handleCreateTestCase = useCallback((): void => {
    console.log('Create test case for project:', projectId);
  }, [projectId]);

  const editRoles: UserRole[] = ['ADMIN', 'PROJECT_MANAGER'];
  const deleteRoles: UserRole[] = ['ADMIN'];
  const createTestCaseRoles: UserRole[] = ['TESTER', 'PROJECT_MANAGER'];

  return (
    <Flex gap={4}>
      <RoleGuard allowedRoles={editRoles}>
        <Button onClick={handleEdit} isDisabled={!onEditId}>
          Edit Project
        </Button>
      </RoleGuard>
      
      <RoleGuard allowedRoles={deleteRoles}>
        <Button 
          colorScheme="red" 
          onClick={handleDelete}
          isDisabled={!onDeleteId}
        >
          Delete Project
        </Button>
      </RoleGuard>
      
      {hasRole(createTestCaseRoles) && (
        <Button onClick={handleCreateTestCase}>
          Create Test Case
        </Button>
      )}
    </Flex>
  );
}
