import React from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import type { TestCaseFormData} from '@/types';
import { TestCaseStatus, TestCasePriority } from '@/types';

interface CreateTestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTestCase: (data: TestCaseFormData) => void;
  projectId: string;
}

export function CreateTestCaseModal({
  isOpen,
  onClose,
  onCreateTestCase,
  projectId,
}: CreateTestCaseModalProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestCaseFormData>();

  const onSubmit = (data: TestCaseFormData): void => {
    onCreateTestCase({ ...data, projectId });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Test Case</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.title}>
                <FormLabel>Title</FormLabel>
                <Input {...register('title', { required: 'Title is required' })} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea {...register('description')} />
              </FormControl>
              <FormControl>
                <FormLabel>Steps</FormLabel>
                <Textarea {...register('steps')} />
              </FormControl>
              <FormControl>
                <FormLabel>Expected Result</FormLabel>
                <Textarea {...register('expectedResult')} />
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select {...register('status')}>
                  {Object.values(TestCaseStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Priority</FormLabel>
                <Select {...register('priority')}>
                  {Object.values(TestCasePriority).map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} type="submit">
              Create
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
