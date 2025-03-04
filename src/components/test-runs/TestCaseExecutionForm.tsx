import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  HStack,
  Radio,
  RadioGroup,
  Text,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Badge,
  Divider
} from '@chakra-ui/react';
import type { TestCase } from '@/types';
import { TestResultStatus } from '@/types/testRun';
import type { TestResultFormData } from '@/types/testRun';

interface TestCaseExecutionFormProps {
  testCase: TestCase;
  projectId: string;
  testRunId: string;
  onComplete: () => void;
  isLast: boolean;
}

export function TestCaseExecutionForm({
  testCase,
  projectId,
  testRunId,
  onComplete,
  isLast
}: TestCaseExecutionFormProps): JSX.Element {
  const [status, setStatus] = useState<TestResultStatus>(TestResultStatus.NOT_EXECUTED);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (): Promise<void> => {
    try {
      setIsSubmitting(true);
      
      const formData: TestResultFormData = {
        status,
        notes: notes.trim() || ''
      };
      
      const response = await fetch(`/api/projects/${projectId}/test-runs/${testRunId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testCaseId: testCase.id,
          ...formData
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit test result');
      }
      
      toast({
        title: 'Test result recorded',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit test result',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="outline" width="100%" mb={4}>
      <CardHeader bg="gray.50">
        <HStack justifyContent="space-between">
          <Heading size="md">{testCase.title}</Heading>
          <Badge colorScheme="blue">{testCase.priority}</Badge>
        </HStack>
      </CardHeader>
      
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontWeight="bold" mb={2}>Description:</Text>
            <Text>{testCase.description || 'No description provided'}</Text>
          </Box>
          
          <Box>
            <Text fontWeight="bold" mb={2}>Steps:</Text>
            <Text whiteSpace="pre-line">
              {typeof testCase.steps === 'string' 
                ? testCase.steps
                : Array.isArray(testCase.steps) 
                  ? (testCase.steps as string[]).map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')
                  : 'No steps provided'}
            </Text>
          </Box>
          
          <Box>
            <Text fontWeight="bold" mb={2}>Expected Result:</Text>
            <Text>{testCase.expectedResult || 'No expected result provided'}</Text>
          </Box>
          
          <Divider my={2} />
          
          <FormControl isRequired>
            <FormLabel>Result</FormLabel>
            <RadioGroup value={status} onChange={(value) => setStatus(value as TestResultStatus)}>
              <HStack spacing={4}>
                <Radio value={TestResultStatus.PASSED} colorScheme="green">
                  Passed
                </Radio>
                <Radio value={TestResultStatus.FAILED} colorScheme="red">
                  Failed
                </Radio>
                <Radio value={TestResultStatus.SKIPPED} colorScheme="yellow">
                  Skipped
                </Radio>
                <Radio value={TestResultStatus.BLOCKED} colorScheme="gray">
                  Blocked
                </Radio>
              </HStack>
            </RadioGroup>
          </FormControl>
          
          <FormControl>
            <FormLabel>Notes</FormLabel>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any observations, issues, or additional information"
              rows={4}
            />
          </FormControl>
          
          <HStack justifyContent="flex-end" spacing={4} pt={2}>
            <Button
              colorScheme="blue"
              isLoading={isSubmitting}
              onClick={handleSubmit}
            >
              {isLast ? 'Submit & Complete' : 'Submit & Next'}
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
} 