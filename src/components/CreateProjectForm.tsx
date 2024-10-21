import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { ProjectFormData } from '@/types';
import  apiClient  from '@/lib/apiClient';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ApiError, ValidationError, DatabaseError } from '@/lib/errors';

interface CreateProjectFormProps {
  onSuccess: () => void;
}

export default function CreateProjectForm({
  onSuccess,
}: CreateProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleFormSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.createProject(data);
      toast({
        title: 'Project created.',
        description: 'Your project has been successfully created.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onSuccess();
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      let errorTitle = 'Error creating project';

      if (error instanceof ValidationError) {
        errorMessage = error.message;
        errorTitle = 'Validation Error';
      } else if (error instanceof DatabaseError) {
        errorMessage = 'A database error occurred. Please try again later.';
        errorTitle = 'Database Error';
      } else if (error instanceof ApiError) {
        errorMessage = error.message;
        errorTitle = `API Error (${error.code})`;
      }

      setError(errorMessage);
      toast({
        title: errorTitle,
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(handleFormSubmit)}>
      {error && <ErrorMessage message={error} />}
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="name">Project Name</FormLabel>
          <Input
            id="name"
            {...register('name', {
              required: 'Project name is required',
              minLength: {
                value: 3,
                message: 'Project name must be at least 3 characters long',
              },
            })}
          />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel htmlFor="description">Description</FormLabel>
          <Textarea
            id="description"
            {...register('description', {
              maxLength: {
                value: 500,
                message: 'Description must not exceed 500 characters',
              },
            })}
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
          Create Project
        </Button>
      </VStack>
    </Box>
  );
}
