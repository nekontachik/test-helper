import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import type { Project } from '@prisma/client';

interface ExtendedProject extends Project {
  description?: string | null;
}

interface EditProjectFormData {
  name: string;
  description?: string | null;
}

interface EditProjectFormProps {
  project: ExtendedProject;
  onSubmit: (data: EditProjectFormData) => void;
  isLoading?: boolean;
}

export const EditProjectForm: React.FC<EditProjectFormProps> = ({ 
  project, 
  onSubmit, 
  isLoading = false 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<EditProjectFormData>({
    defaultValues: {
      name: project.name,
      description: project.description || ''
    }
  });

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4}>
        <FormControl isRequired isInvalid={!!errors.name}>
          <FormLabel>Name</FormLabel>
          <Input {...register('name', { required: 'Name is required' })} />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input {...register('description')} />
        </FormControl>

        <Button 
          type="submit" 
          colorScheme="blue" 
          width="full"
          isLoading={isLoading}
        >
          Update Project
        </Button>
      </VStack>
    </Box>
  );
};
