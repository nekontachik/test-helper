import { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
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
import { ProjectFormData } from '@/types';
import { useToast } from '@/hooks/useToast';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (data: ProjectFormData) => Promise<void>;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreateProject,
}: CreateProjectModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccessToast, showErrorToast } = useToast();

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      await onCreateProject(data);
      showSuccessToast('Project created successfully');
      reset();
      onClose();
    } catch (error) {
      showErrorToast('Failed to create project. Please try again.');
      console.error('Failed to create project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Project</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Project Name</FormLabel>
              <Input
                {...register('name', {
                  required: 'Project name is required',
                  minLength: {
                    value: 3,
                    message: 'Name must be at least 3 characters long',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Name must not exceed 50 characters',
                  },
                })}
                placeholder="Enter project name"
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit" isLoading={isSubmitting}>
              Create Project
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
