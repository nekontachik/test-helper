import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Project, ProjectFormData } from '@/types';

interface EditProjectFormProps {
  project: Project;
  onUpdateProject: (data: ProjectFormData) => void;
}

export default function EditProjectForm({
  project,
  onUpdateProject,
}: EditProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: project.name,
      description: project.description,
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    onUpdateProject(data);
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Project Name</FormLabel>
          <Input
            {...register('name', { required: 'Project name is required' })}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea {...register('description')} />
        </FormControl>
        <Button type="submit" colorScheme="blue">
          Update Project
        </Button>
      </VStack>
    </Box>
  );
}
