import { prisma } from '@/lib/prisma';
import type { TestRunReport } from '@/types/report';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { TestRun, TestCaseResult } from '@prisma/client';
import { Parser } from 'json2csv';

interface TestResultWithRelations extends TestCaseResult {
  testCase: {
    title: string;
  };
  executedBy: {
    name: string | null;
  };
}

interface TestRunWithResults extends TestRun {
  testResults: TestResultWithRelations[];
}

interface CSVTransformItem {
  testCaseName: string;
  status: string;
  executedBy: string;
  executedAt: Date;
  notes?: string | null;
}

// Define the type for jspdf-autotable
interface AutoTableOptions {
  startY: number;
  head: string[][];
  body: (string | number)[][];
  [key: string]: unknown;
}

/**
 * Service for generating test run reports
 */
export class ReportService {
  async generateTestRunReport(runId: string): Promise<TestRunReport> {
    const testRun = await prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        testResults: {
          include: {
            testCase: {
              select: {
                title: true
              }
            },
            executedBy: {
              select: {
                name: true
              }
            }
          }
        }
      }
    }) as unknown as TestRunWithResults;

    if (!testRun) {
      throw new Error(`Test run with ID ${runId} not found`);
    }

    const statistics = this.calculateStatistics(testRun.testResults);

    // Create the report object with the correct types
    const report: TestRunReport = {
      testRun: {
        id: testRun.id,
        name: testRun.name,
        startedAt: new Date(testRun.createdAt),
        ...(testRun.completedAt ? { completedAt: new Date(testRun.completedAt) } : {}),
        status: testRun.status
      },
      statistics,
      results: testRun.testResults.map(result => ({
        testCaseId: result.testCaseId,
        testCaseName: result.testCase.title,
        status: result.status,
        executedBy: result.executedBy.name || 'Unknown',
        executedAt: new Date(result.executedAt),
        ...(result.notes ? { notes: result.notes } : {})
      }))
    };

    return report;
  }

  private calculateStatistics(results: TestResultWithRelations[]): TestRunReport['statistics'] {
    const total = results.length;
    const passed = results.filter(r => r.status === 'PASSED').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    const blocked = results.filter(r => r.status === 'BLOCKED').length;
    const skipped = results.filter(r => r.status === 'SKIPPED').length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    // Calculate duration between first and last test execution
    let duration = 0;
    if (results.length > 0) {
      const sortedResults = [...results].sort(
        (a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
      );
      
      const firstResult = sortedResults[0];
      const lastResult = sortedResults[sortedResults.length - 1];
      
      if (firstResult) {
        duration = lastResult 
          ? new Date(lastResult.executedAt).getTime() - new Date(firstResult.executedAt).getTime()
          : 0;
      }
    }

    return {
      total,
      passed,
      failed,
      blocked,
      skipped,
      passRate,
      duration
    };
  }

  async generatePDF(report: TestRunReport): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Test Run Report', 14, 22);
    
    // Add test run info
    doc.setFontSize(12);
    doc.text(`Test Run: ${report.testRun.name}`, 14, 32);
    doc.text(`Status: ${report.testRun.status}`, 14, 38);
    doc.text(`Started: ${format(report.testRun.startedAt, 'PPpp')}`, 14, 44);
    
    if (report.testRun.completedAt) {
      doc.text(`Completed: ${format(report.testRun.completedAt, 'PPpp')}`, 14, 50);
    }
    
    // Add statistics
    doc.setFontSize(14);
    doc.text('Summary', 14, 60);
    
    doc.setFontSize(12);
    doc.text(`Total: ${report.statistics.total}`, 14, 68);
    doc.text(`Passed: ${report.statistics.passed} (${report.statistics.passRate}%)`, 14, 74);
    doc.text(`Failed: ${report.statistics.failed}`, 14, 80);
    doc.text(`Blocked: ${report.statistics.blocked}`, 14, 86);
    doc.text(`Skipped: ${report.statistics.skipped}`, 14, 92);
    doc.text(`Duration: ${Math.round(report.statistics.duration / 1000 / 60)} minutes`, 14, 98);
    
    // Add results table
    doc.setFontSize(14);
    doc.text('Test Results', 14, 110);
    
    const tableData = report.results.map(result => [
      result.testCaseName,
      result.status,
      result.executedBy,
      format(result.executedAt, 'PPpp'),
      result.notes || ''
    ]);
    
    // Use a type assertion to unknown first to avoid TypeScript errors
    // jspdf-autotable adds the autoTable method to jsPDF
    const docWithAutoTable = doc as unknown as {
      autoTable: (options: AutoTableOptions) => void;
    };
    
    docWithAutoTable.autoTable({
      startY: 115,
      head: [['Test Case', 'Status', 'Executed By', 'Executed At', 'Notes']],
      body: tableData,
    });
    
    return Buffer.from(doc.output('arraybuffer'));
  }

  async generateCSV(report: TestRunReport): Promise<string> {
    const fields = ['testCaseName', 'status', 'executedBy', 'executedAt', 'notes'];
    
    const data: CSVTransformItem[] = report.results.map(result => ({
      testCaseName: result.testCaseName,
      status: result.status,
      executedBy: result.executedBy,
      executedAt: result.executedAt,
      ...(result.notes ? { notes: result.notes } : {})
    }));
    
    const parser = new Parser({ fields });
    return parser.parse(data);
  }
} 