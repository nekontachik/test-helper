import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  VStack,
  Flex,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/hooks';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/modal';
import { TestCase, TestCaseVersion } from '@/types';
import Link from 'next/link';
import { useDeleteTestCase, useTestCaseVersions, useRestoreTestCaseVersion } from '@/hooks/useTestCase';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from './ErrorBoundary';
import { useToast } from '@/hooks/useToast';

interface TestCaseDetailsProps {
  testCase: TestCase;
  projectId: string;
}

export function TestCaseDetails({ testCase, projectId }: TestCaseDetailsProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteTestCase = useDeleteTestCase(projectId);
  const router = useRouter();
  const { showSuccessToast, showErrorToast } = useToast();
  const { data: versions, isLoading: isLoadingVersions } = useTestCaseVersions(projectId, testCase.id);
  const [selectedVersion, setSelectedVersion] = useState<TestCaseVersion | null>(null);
  const restoreVersion = useRestoreTestCaseVersion(projectId, testCase.id);

  const handleDelete = () => {
    deleteTestCase.mutate(testCase.id, {
      onSuccess: () => {
        onClose();
        showSuccessToast('Test case deleted successfully');
        router.push(`/projects/${projectId}/test-cases`);
      },
      onError: (error: Error) => {
        showErrorToast(`Failed to delete test case: ${error.message}`);
      },
    });
  };

  const handleVersionSelect = (version: TestCaseVersion) => {
    setSelectedVersion(version);
  };

  const handleRestore = (versionNumber: number) => {
    restoreVersion.mutate(versionNumber, {
      onSuccess: () => {
        showSuccessToast('Test case version restored successfully');
        setSelectedVersion(null);
      },
      onError: (error: Error) => {
        showErrorToast(`Failed to restore test case version: ${error.message}`);
      },
    });
  };

  return (
    <ErrorBoundary>
      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="lg">{testCase.title}</Heading>
          <Flex>
            <Link href={`/projects/${projectId}/test-cases/${testCase.id}/edit`} passHref>
              <Button as="a" colorScheme="blue" mr={2}>Edit Test Case</Button>
            </Link>
            <Button colorScheme="red" onClick={onOpen}>Delete</Button>
          </Flex>
        </Flex>
        <VStack align="start" spacing={4}>
          <Heading size="lg">{testCase.title}</Heading>
          <Flex>
            <Badge colorScheme={testCase.status === 'ACTIVE' ? 'green' : 'red'} mr={2}>
              {testCase.status}
            </Badge>
            <Badge colorScheme={testCase.priority === 'HIGH' ? 'red' : testCase.priority === 'MEDIUM' ? 'yellow' : 'blue'}>
              {testCase.priority}
            </Badge>
          </Flex>
          <Text>{testCase.description}</Text>
          <Box>
            <Heading size="md" mb={2}>Expected Result</Heading>
            <Text>{testCase.expectedResult}</Text>
          </Box>
          <Flex>
            <Text fontWeight="bold" mr={2}>Created:</Text>
            <Text>{new Date(testCase.createdAt).toLocaleString()}</Text>
          </Flex>
          <Flex>
            <Text fontWeight="bold" mr={2}>Last Updated:</Text>
            <Text>{new Date(testCase.updatedAt).toLocaleString()}</Text>
          </Flex>
        </VStack>
        
        <Heading size="md" mt={6} mb={4}>Version History</Heading>
        {isLoadingVersions ? (
          <Text>Loading version history...</Text>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Version</Th>
                <Th>Updated At</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {versions?.map((version: TestCaseVersion) => (
                <Tr key={version.versionNumber}>
                  <Td>{version.versionNumber}</Td>
                  <Td>{new Date(version.updatedAt).toLocaleString()}</Td>
                  <Td>
                    <Button size="sm" onClick={() => handleVersionSelect(version)}>
                      View
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirm Deletion</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to delete this test case? This action cannot be undone.
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" mr={3} onClick={handleDelete} isLoading={deleteTestCase.isLoading}>
                Delete
              </Button>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={!!selectedVersion} onClose={() => setSelectedVersion(null)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Version {selectedVersion?.versionNumber}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="start" spacing={4}>
                <Text><strong>Title:</strong> {selectedVersion?.title}</Text>
                <Text><strong>Description:</strong> {selectedVersion?.description}</Text>
                <Text><strong>Status:</strong> {selectedVersion?.status}</Text>
                <Text><strong>Priority:</strong> {selectedVersion?.priority}</Text>
                <Text><strong>Expected Result:</strong> {selectedVersion?.expectedResult}</Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={() => setSelectedVersion(null)}>
                Close
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => selectedVersion && handleRestore(selectedVersion.versionNumber)}
                isLoading={restoreVersion.isLoading}
              >
                Restore This Version
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </ErrorBoundary>
  );
}
