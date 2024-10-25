import React from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

interface CreateProjectFormData {
  name: string;
  description?: string;
}

interface CreateProjectFormProps {
  onSubmit: (data: CreateProjectFormData) => void;
  isLoading?: boolean;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onSubmit, isLoading = false }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectFormData>();

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
          Create Project
        </Button>
      </VStack>
    </Box>
  );
};
