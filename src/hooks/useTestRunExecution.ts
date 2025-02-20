import { useState } from 'react';
import type { TestRunResult } from '@/types';

export function useTestRunExecution(projectId: string, testRunId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadEvidence = async (files: File[]): Promise<string[]> => {
    if (!files.length) return [];
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`/api/projects/${projectId}/uploads`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Failed to upload file');
        
        const { url } = await response.json();
        return url;
      });
      
      const urls = await Promise.all(uploadPromises);
      setUploadProgress(100);
      return urls;
    } finally {
      setIsUploading(false);
    }
  };

  const executeTestRun = async (results: TestRunResult[]) => {
    const resultsWithUrls = await Promise.all(
      results.map(async (result) => {
        const evidenceUrls = result.evidence 
          ? await uploadEvidence(result.evidence)
          : [];
        
        return {
          ...result,
          evidenceUrls,
        };
      })
    );

    const response = await fetch(
      `/api/projects/${projectId}/test-runs/${testRunId}/execute`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: resultsWithUrls }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to execute test run');
    }

    return response.json();
  };

  return {
    executeTestRun,
    isUploading,
    uploadProgress,
  };
} 