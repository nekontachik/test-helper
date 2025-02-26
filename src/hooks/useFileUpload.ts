import { useState, useCallback } from 'react';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  retryCount: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export function useFileUpload(projectId: string): {
  uploadFiles: (files: File[]) => Promise<string[]>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  canRetry: boolean;
} {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    retryCount: 0,
  });

  const uploadFile = useCallback(async (file: File, retryAttempt = 0): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/projects/${projectId}/uploads`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const { url } = await response.json();
      return url;
    } catch (err) {
      const error = err as Error;
      if (retryAttempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return uploadFile(file, retryAttempt + 1);
      }
      throw new Error(`Failed to upload ${file.name} after ${MAX_RETRIES} attempts: ${error.message}`);
    }
  }, [projectId]);

  const uploadFiles = useCallback(async (files: File[]): Promise<string[]> => {
    if (!files.length) return [];
    
    setUploadState(prev => ({ ...prev, isUploading: true, progress: 0, error: null }));
    
    try {
      const uploadPromises = files.map(async (file, index) => {
        try {
          const url = await uploadFile(file);
          setUploadState(prev => ({
            ...prev,
            progress: ((index + 1) / files.length) * 100
          }));
          return url;
        } catch (err) {
          const error = err as Error;
          setUploadState(prev => ({
            ...prev,
            error: error.message,
            retryCount: prev.retryCount + 1
          }));
          throw error;
        }
      });
      
      const urls = await Promise.all(uploadPromises);
      setUploadState(prev => ({ ...prev, progress: 100 }));
      return urls;
    } finally {
      setUploadState(prev => ({ ...prev, isUploading: false }));
    }
  }, [uploadFile]);

  return {
    uploadFiles,
    isUploading: uploadState.isUploading,
    progress: uploadState.progress,
    error: uploadState.error,
    canRetry: uploadState.retryCount < MAX_RETRIES
  };
} 