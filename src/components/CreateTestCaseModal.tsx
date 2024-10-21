import React from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
} from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/modal';
import { useForm } from 'react-hook-form';
import { TestCaseFormData, TestCaseStatus, TestCasePriority } from '@/types';

interface CreateTestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TestCaseFormData) => void;
  projectId: string;
}

export function CreateTestCaseModal({
  isOpen,
  onClose,
  onSubmit,
  projectId,
}: CreateTestCaseModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestCaseFormData>();

  const onSubmitForm = (data: TestCaseFormData) => {
    onSubmit({ ...data, projectId });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <ModalHeader>Create New Test Case</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.title}>
                <FormLabel>Title</FormLabel>
                <Input
                  {...register('title', { required: 'Title is required' })}
                />
              </FormControl>
              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  {...register('description', {
                    required: 'Description is required',
                  })}
                />
              </FormControl>
              <FormControl isInvalid={!!errors.expectedResult}>
                <FormLabel>Expected Result</FormLabel>
                <Textarea
                  {...register('expectedResult', {
                    required: 'Expected result is required',
                  })}
                />
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
