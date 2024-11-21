'use client';

import { Button, Flex } from '@chakra-ui/react';
import { RoleGuard } from './RoleGuard';
import { useRole } from '@/hooks/useRole';
import { useCallback } from 'react';
import { UserRole } from '@/types/auth';

interface ProjectActionsProps {
  projectId: string;
  onEditId?: string;
  onDeleteId?: string;
}

export function ProjectActions({ projectId, onEditId, onDeleteId }: ProjectActionsProps) {
  const { hasRole } = useRole();

  const handleEdit = useCallback(() => {
    if (onEditId) {
      console.log('Edit project:', onEditId);
    }
  }, [onEditId]);

  const handleDelete = useCallback(() => {
    if (onDeleteId) {
      console.log('Delete project:', onDeleteId);
    }
  }, [onDeleteId]);

  const handleCreateTestCase = useCallback(() => {
    console.log('Create test case for project:', projectId);
  }, [projectId]);

  const editRoles: UserRole[] = [UserRole.ADMIN, UserRole.MANAGER];
  const deleteRoles: UserRole[] = [UserRole.ADMIN];
  const createTestCaseRoles: UserRole[] = [UserRole.EDITOR, UserRole.MANAGER];

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
