import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/useToast';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/constants';
import type { UseFormReturn } from 'react-hook-form';
import type { TestResultFormData } from '@/lib/validations/testResult';
import { useErrorHandler } from './useErrorHandler';
import { FileUploadError } from '@/lib/errors/specific/testErrors';

export function useFileUploadHandler(
  projectId: string,
  _form: UseFormReturn<TestResultFormData> // Prefix with _ to indicate it's intentionally unused
): {
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<string[] | undefined>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  clearError: () => void;
} {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { withErrorHandling } = useErrorHandler();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new FileUploadError(`${file.name} is too large. Maximum size is 5MB.`);
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new FileUploadError(`${file.name} has an unsupported file type.`);
    }
    return true;
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    return withErrorHandling(async () => {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        clearError();

        // Validate all files first
        files.forEach(validateFile);

        const uploadedUrls: string[] = [];
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`/api/projects/${projectId}/uploads`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new FileUploadError(error.message || 'Failed to upload file', {
              status: response.status,
              details: {
                fileName: file.name,
                fileSize: file.size,
                ...error.details,
              },
            });
          }

          const { url } = await response.json();
          uploadedUrls.push(url);
          setUploadProgress((uploadedUrls.length / files.length) * 100);
        }

        return uploadedUrls;
      } catch (error) {
        if (error instanceof FileUploadError) {
          setError(error.message);
          toast({
            title: "Upload failed",
            description: error.message,
            variant: "destructive"
          });
        }
        throw error;
      } finally {
        setIsUploading(false);
      }
    }, {
      retry: true,
      retryOptions: {
        maxAttempts: 2,
        delayMs: 1000
      },
      silent: true // We handle the error display ourselves
    });
  }, [projectId, validateFile, toast, withErrorHandling, clearError]);

  return {
    handleFileChange,
    isUploading,
    uploadProgress,
    error,
    clearError
  };
} 