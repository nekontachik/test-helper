import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from '@chakra-ui/react';
import { useErrorToast } from '../hooks/useErrorToast';

interface ProjectFormData {
  name: string;
  description: string;
}

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<void>;
}

export function ProjectForm(props: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>();
  const showErrorToast = useErrorToast();

  const onSubmitForm = async (data: ProjectFormData) => {
    try {
      await props.onSubmit(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      showErrorToast('Error creating project', errorMessage);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmitForm)}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="name">Project Name</FormLabel>
          <Input
            id="name"
            {...register('name', { required: 'Project name is required' })}
          />
        </FormControl>
        <FormControl isInvalid={!!errors.description}>
          <FormLabel htmlFor="description">Description</FormLabel>
          <Input
            id="description"
            {...register('description', {
              required: 'Description is required',
            })}
          />
        </FormControl>
        <Button type="submit" isLoading={isSubmitting}>
          Create Project
        </Button>
      </VStack>
    </Box>
  );
}
