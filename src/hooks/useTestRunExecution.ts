import { useState } from 'react';
import type { TestResult } from '@/types/testResults';

interface TestResultWithEvidence extends TestResult {
  evidence?: File[];
}

export function useTestRunExecution(projectId: string, testRunId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadEvidence = async (files: File[]): Promise<string[]> => {
    if (!files.length) return [];
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const total = files.length;
      const urls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        
        const response = await fetch(`/api/projects/${projectId}/uploads`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Failed to upload file');
        
        const { url } = await response.json();
        urls.push(url);
        
        setUploadProgress(((i + 1) / total) * 100);
      }
      
      return urls;
    } finally {
      setIsUploading(false);
    }
  };

  const executeTestRun = async (results: TestResultWithEvidence[]) => {
    const MAX_RETRIES = 3;
    const INITIAL_RETRY_DELAY = 1000;
    
    for (let retries = 0; retries < MAX_RETRIES; retries++) {
      try {
        const resultsWithUrls = await Promise.all(
          results.map(async (result) => ({
            testCaseId: result.testCaseId,
            status: result.status,
            notes: result.notes,
            evidenceUrls: result.evidence 
              ? await uploadEvidence(result.evidence)
              : result.evidenceUrls,
          }))
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
          const error = await response.json();
          throw new Error(error.message || 'Failed to execute test run');
        }
        
        return await response.json();
      } catch (error) {
        if (retries === MAX_RETRIES - 1) throw error;
        await new Promise(resolve => 
          setTimeout(resolve, INITIAL_RETRY_DELAY * Math.pow(2, retries))
        );
      }
    }
    throw new Error('Failed to execute test run after maximum retries');
  };

  return {
    executeTestRun,
    isUploading,
    uploadProgress,
  };
} 