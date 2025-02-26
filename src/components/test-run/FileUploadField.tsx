'use client';

import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { FilePreview } from '@/components/FilePreview';
import { useFileUploadHandler } from '@/hooks/useFileUploadHandler';
import { ErrorDisplay } from '../ErrorDisplay';
import type { UseFormReturn } from 'react-hook-form';
import type { TestResultFormData } from '@/lib/validations/testResult';

interface FileUploadFieldProps {
  form: UseFormReturn<TestResultFormData>;
  projectId: string;
  files: string[];
  onFilesChange: (files: string[]) => void;
  isDisabled?: boolean;
}

export function FileUploadField({ form, projectId, files, onFilesChange }: FileUploadFieldProps): JSX.Element {
  const {
    handleFileChange,
    isUploading,
    uploadProgress,
    error,
    clearError
  } = useFileUploadHandler(projectId, form);

  const handleFileRemove = (index: number): void => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    try {
      const fileList = event.target.files;
      if (!fileList?.length) return;

      const uploadedFiles = await handleFileChange(event);
      if (uploadedFiles) {
        onFilesChange([...files, ...uploadedFiles]);
      }
    } catch (error) {
      // Error is handled by useFileUploadHandler
      console.error('File upload failed:', error);
    } finally {
      // Clear the input value to allow uploading the same file again
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="file"
        multiple
        accept="image/*,.pdf"
        onChange={handleUpload}
        className="cursor-pointer"
        disabled={isUploading}
      />
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading evidence...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}
      {error && (
        <ErrorDisplay
          message={error}
          onRetry={() => clearError()}
        />
      )}
      {files.length > 0 && (
        <div className="mt-4">
          <FilePreview
            files={files.map(name => ({ name }))}
            onRemove={handleFileRemove}
          />
        </div>
      )}
    </div>
  );
} 