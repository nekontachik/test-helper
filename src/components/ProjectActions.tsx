'use client';

import { Button, Flex } from '@chakra-ui/react';
import { RoleGuard } from './RoleGuard';
import { UserRole } from '@/types/auth';
import { useRole } from '@/hooks/useRole';
import { useCallback } from 'react';

interface ProjectActionsProps {
  projectId: string;
  onEditId?: string;
  onDeleteId?: string;
}

export function ProjectActions({ projectId, onEditId, onDeleteId }: ProjectActionsProps) {
  const { hasRole } = useRole();

  // Move handlers inside component to handle actions
  const handleEdit = useCallback(() => {
    if (onEditId) {
      // Handle edit action, e.g., navigate or dispatch
      console.log('Edit project:', onEditId);
    }
  }, [onEditId]);

  const handleDelete = useCallback(() => {
    if (onDeleteId) {
      // Handle delete action, e.g., show confirmation or dispatch
      console.log('Delete project:', onDeleteId);
    }
  }, [onDeleteId]);

  const handleCreateTestCase = useCallback(() => {
    // Handle test case creation
    console.log('Create test case for project:', projectId);
  }, [projectId]);

  return (
    <Flex gap={4}>
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PROJECT_MANAGER]}>
        <Button onClick={handleEdit} isDisabled={!onEditId}>
          Edit Project
        </Button>
      </RoleGuard>
      
      <RoleGuard allowedRoles={[UserRole.ADMIN]}>
        <Button 
          colorScheme="red" 
          onClick={handleDelete}
          isDisabled={!onDeleteId}
        >
          Delete Project
        </Button>
      </RoleGuard>
      
      {hasRole([UserRole.TESTER, UserRole.PROJECT_MANAGER]) && (
        <Button onClick={handleCreateTestCase}>
          Create Test Case
        </Button>
      )}
    </Flex>
  );
}
