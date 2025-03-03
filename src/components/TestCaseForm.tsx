'use client';

import React, { useState } from 'react';
import { 
  VStack, 
  FormControl, 
  FormLabel, 
  Input, 
  Textarea, 
  Select, 
  Button, 
  SimpleGrid,
  Box,
  useToast,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  Icon,
  useColorModeValue,
  IconButton,
  HStack,
  Text
} from '@chakra-ui/react';
import { FiFileText, FiCheckCircle, FiAlertCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import { createFormHook } from '@/lib/hooks/createFormHook';
import { useCreateTestCase, useUpdateTestCase } from '@/hooks/useTestCaseMutations';
import type { TestCase } from '@/types/testCase';
import { TestCaseStatus, TestCasePriority } from '@/types/testCase';
import { testCaseSchema, type CreateTestCase } from '@/lib/validations/testCase';

interface TestStep {
  order: number;
  description: string;
  expectedResult: string;
}

interface TestCaseFormProps {
  testCase?: TestCase;
  projectId: string;
  onSubmit?: (data: CreateTestCase) => Promise<void>;
  isLoading?: boolean;
}

export function TestCaseForm({ testCase, projectId, onSubmit, isLoading }: TestCaseFormProps): JSX.Element {
  const createTestCase = useCreateTestCase();
  const updateTestCase = useUpdateTestCase();
  const toast = useToast();
  const [steps, setSteps] = useState<TestStep[]>(
    testCase?.steps?.map(step => ({
      order: step.order,
      description: step.description,
      expectedResult: step.expectedResult
    })) || [{ order: 1, description: '', expectedResult: '' }]
  );
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { form, handleSubmit, isSubmitting } = createFormHook({
    schema: testCaseSchema,
    defaultValues: testCase ? {
      ...testCase,
      projectId,
      createdAt: testCase.createdAt.toString(),
      updatedAt: testCase.updatedAt.toString()
    } : {
      title: '',
      description: '',
      status: TestCaseStatus.DRAFT,
      priority: TestCasePriority.MEDIUM,
      projectId,
      steps,
      id: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    onSubmit: async (data: CreateTestCase): Promise<void> => {
      try {
        if (onSubmit) {
          await onSubmit(data);
        } else if (testCase) {
          await updateTestCase.mutateAsync({ id: testCase.id, data });
          toast({
            title: 'Test case updated',
            description: 'The test case has been successfully updated.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          await createTestCase.mutateAsync(data);
          toast({
            title: 'Test case created',
            description: 'The test case has been successfully created.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  })();

  const { register, formState: { errors } } = form;

  const addStep = (): void => {
    setSteps([...steps, { order: steps.length + 1, description: '', expectedResult: '' }]);
  };

  const removeStep = (index: number): void => {
    const newSteps = steps.filter((_, i: number) => i !== index);
    newSteps.forEach((step: TestStep, i: number) => {
      step.order = i + 1;
    });
    setSteps(newSteps);
  };

  return (
    <Box 
      as="form" 
      onSubmit={handleSubmit}
      bg={bgColor}
      borderColor={borderColor}
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      shadow="sm"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
    >
      <VStack spacing={6} align="stretch">
        <FormControl isInvalid={!!errors.title}>
          <FormLabel>Title</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiFileText} color="gray.500" />
            </InputLeftElement>
            <Input 
              {...register('title')} 
              pl={10}
              placeholder="Enter test case title"
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
            />
          </InputGroup>
          <FormErrorMessage>
            {errors.title?.message}
          </FormErrorMessage>
        </FormControl>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl isInvalid={!!errors.status}>
            <FormLabel>Status</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiCheckCircle} color="gray.500" />
              </InputLeftElement>
              <Select 
                {...register('status')}
                pl={10}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
              >
                {Object.values(TestCaseStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </InputGroup>
            <FormErrorMessage>
              {errors.status?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.priority}>
            <FormLabel>Priority</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiAlertCircle} color="gray.500" />
              </InputLeftElement>
              <Select 
                {...register('priority')}
                pl={10}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
              >
                {Object.values(TestCasePriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </Select>
            </InputGroup>
            <FormErrorMessage>
              {errors.priority?.message}
            </FormErrorMessage>
          </FormControl>
        </SimpleGrid>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel>Description</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiFileText} color="gray.500" />
            </InputLeftElement>
            <Textarea 
              {...register('description')} 
              pl={10}
              minH="120px"
              placeholder="Enter test case description"
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
            />
          </InputGroup>
          <FormErrorMessage>
            {errors.description?.message}
          </FormErrorMessage>
        </FormControl>

        <Box>
          <HStack justify="space-between" mb={4}>
            <FormLabel mb={0}>Test Steps</FormLabel>
            <IconButton
              aria-label="Add step"
              icon={<FiPlus />}
              size="sm"
              onClick={addStep}
              colorScheme="blue"
              variant="ghost"
            />
          </HStack>
          <VStack spacing={4}>
            {steps.map((step: TestStep, index: number) => (
              <Box
                key={step.order}
                p={4}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
                position="relative"
              >
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="medium">Step {step.order}</Text>
                  <IconButton
                    aria-label="Remove step"
                    icon={<FiTrash2 />}
                    size="sm"
                    onClick={() => removeStep(index)}
                    colorScheme="red"
                    variant="ghost"
                  />
                </HStack>
                <VStack spacing={4}>
                  <FormControl isInvalid={!!errors.steps?.[index]?.description}>
                    <FormLabel fontSize="sm">Description</FormLabel>
                    <Textarea
                      {...register(`steps.${index}.description`)}
                      placeholder="Enter step description"
                      rows={2}
                    />
                    <FormErrorMessage>
                      {errors.steps?.[index]?.description?.message}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.steps?.[index]?.expectedResult}>
                    <FormLabel fontSize="sm">Expected Result</FormLabel>
                    <Textarea
                      {...register(`steps.${index}.expectedResult`)}
                      placeholder="Enter expected result"
                      rows={2}
                    />
                    <FormErrorMessage>
                      {errors.steps?.[index]?.expectedResult?.message}
                    </FormErrorMessage>
                  </FormControl>
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>

        <Button 
          type="submit" 
          colorScheme="blue"
          size="lg"
          isLoading={isLoading !== undefined ? isLoading : isSubmitting}
          loadingText={testCase ? 'Updating...' : 'Creating...'}
          _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
          transition="all 0.2s"
        >
          {testCase ? 'Update Test Case' : 'Create Test Case'}
        </Button>
      </VStack>
    </Box>
  );
}
