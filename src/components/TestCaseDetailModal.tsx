import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { TestCaseDetail } from './TestCaseDetail';

interface TestCaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  testCaseId: string;
}

export function TestCaseDetailModal({
  isOpen,
  onClose,
  projectId,
  testCaseId,
}: TestCaseDetailModalProps): JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Test Case Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TestCaseDetail projectId={projectId} testCaseId={testCaseId} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
