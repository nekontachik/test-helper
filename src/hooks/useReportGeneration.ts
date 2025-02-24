import { useState } from 'react';
import { saveAs } from 'file-saver';

export function useReportGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateReport = async (projectId: string, runId: string, format: 'PDF' | 'JSON' = 'PDF') => {
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
      } else {
        return await response.json();
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to generate report'));
      throw err;
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