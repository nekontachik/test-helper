import { useState } from 'react';
import {
  Box,
  Badge,
  Heading,
  Text,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { usePermissions } from '@/hooks/usePermissions';
import { Action, Resource } from '@/lib/auth/rbac/types';
import { TestCaseForm } from './TestCaseForm';
import type { TestCase, CreateTestCase } from '@/lib/validations/testCase';

interface TestCaseCardProps {
  testCase: TestCase;
  projectId: string;
  onUpdate: (updatedTestCase: TestCase) => void;
  onDelete: (id: string) => void;
}

export function TestCaseCard({ testCase, projectId, onUpdate, onDelete }: TestCaseCardProps): JSX.Element {
  const { can } = usePermissions();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const canEdit = can(Action.UPDATE, Resource.TEST_CASE);
  const canDelete = can(Action.DELETE, Resource.TEST_CASE);

  const priorityColors = {
    LOW: 'green',
    MEDIUM: 'yellow',
    HIGH: 'red',
  };

  const handleUpdate = async (data: TestCase | CreateTestCase): Promise<void> => {
    if (!testCase.id) return;

    try {
      setIsUpdating(true);
      const response = await fetch(
        `/api/projects/${projectId}/test-cases/${testCase.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            id: testCase.id,
            projectId
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update test case');
      
      const updatedTestCase = await response.json();
      onUpdate(updatedTestCase);
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update test case',
        status: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!testCase.id) return;

    try {
      setIsDeleting(true);
      const response = await fetch(
        `/api/projects/${projectId}/test-cases/${testCase.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete test case');
      
      onDelete(testCase.id);
      toast({
        title: 'Test case deleted',
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete test case',
        status: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Box
        p={4}
        borderWidth="1px"
        borderRadius="lg"
        _hover={{ shadow: 'md' }}
        role="article"
        aria-labelledby={`test-case-title-${testCase.id}`}
      >
        <HStack justify="space-between" mb={2}>
          <Heading 
            size="md" 
            id={`test-case-title-${testCase.id}`}
            tabIndex={0}
          >
            {testCase.title}
          </Heading>
          <HStack>
            <Badge 
              colorScheme={priorityColors[testCase.priority]}
              aria-label={`Priority: ${testCase.priority}`}
            >
              {testCase.priority}
            </Badge>
            {canEdit && (
              <IconButton
                aria-label={`Edit test case: ${testCase.title}`}
                icon={<FiEdit2 />}
                size="sm"
                onClick={onOpen}
              />
            )}
            {canDelete && (
              <IconButton
                aria-label={`Delete test case: ${testCase.title}`}
                icon={<FiTrash2 />}
                size="sm"
                colorScheme="red"
                onClick={handleDelete}
                isLoading={isDeleting}
              />
            )}
          </HStack>
        </HStack>
        <Text 
          noOfLines={2} 
          color="gray.600"
          tabIndex={0}
          aria-label="Test case description"
        >
          {testCase.description}
        </Text>
      </Box>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="xl"
        closeOnOverlayClick={!isUpdating}
        aria-labelledby={`edit-modal-${testCase.id}`}
      >
        <ModalOverlay />
        <ModalContent role="dialog" aria-modal="true">
          <ModalHeader id={`edit-modal-${testCase.id}`}>
            Edit Test Case: {testCase.title}
          </ModalHeader>
          <ModalCloseButton isDisabled={isUpdating} />
          <ModalBody pb={6}>
            <TestCaseForm
              initialData={testCase}
              onSubmit={handleUpdate}
              isEditing
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
} 