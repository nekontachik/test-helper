import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { Download, Loader } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GenerateReportButtonProps {
  projectId: string;
  runId: string;
  disabled?: boolean;
}

export function GenerateReportButton({ projectId, runId, disabled }: GenerateReportButtonProps) {
  const { generateReport, isGenerating, error } = useReportGeneration();
  const [format, setFormat] = useState<'PDF' | 'JSON'>('PDF');

  const handleGenerate = async () => {
    try {
      await generateReport(projectId, runId, format);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isGenerating}
        >
          {isGenerating ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {
          setFormat('PDF');
          handleGenerate();
        }}>
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          setFormat('JSON');
          handleGenerate();
        }}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 