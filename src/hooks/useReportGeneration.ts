import { useState } from 'react';
import { saveAs } from 'file-saver';

interface ReportGenerationResult {
  generateReport: (projectId: string, runId: string, format?: 'PDF' | 'JSON') => Promise<unknown>;
  isGenerating: boolean;
  error: Error | null;
}

export function useReportGeneration(): ReportGenerationResult {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateReport = async (
    projectId: string, 
    runId: string, 
    format: 'PDF' | 'JSON' = 'PDF'
  ): Promise<unknown> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, format })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      if (format === 'PDF') {
        const blob = await response.blob();
        saveAs(blob, `test-run-${runId}.pdf`);
        return undefined;
      } else {
        return await response.json();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate report');
      setError(error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateReport,
    isGenerating,
    error
  };
} 