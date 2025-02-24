import { prisma } from '@/lib/prisma';
import { TestRunReport } from '@/types/report';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { TestRun, TestCaseResult, User } from '@prisma/client';
import { Parser } from 'json2csv';

interface TestResultWithRelations extends TestCaseResult {
  testCase: {
    name: string;
  };
  user: {
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
  notes?: string;
}

export class ReportService {
  async generateTestRunReport(runId: string): Promise<TestRunReport> {
    const testRun = await prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        testResults: {
          include: {
            testCase: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    }) as TestRunWithResults | null;

    if (!testRun) {
      throw new Error('Test run not found');
    }

    const statistics = this.calculateStatistics(testRun.testResults);

    return {
      testRun: {
        id: testRun.id,
        name: testRun.name,
        startedAt: new Date(testRun.createdAt),
        completedAt: testRun.completedAt || undefined,
        status: testRun.status
      },
      statistics,
      results: testRun.testResults.map(result => ({
        testCaseId: result.testCaseId,
        testCaseName: result.testCase.name,
        status: result.status,
        executedBy: result.user.name || 'Unknown',
        executedAt: result.createdAt,
        notes: result.notes || undefined
      }))
    };
  }

  private calculateStatistics(results: any[]): TestRunReport['statistics'] {
    const total = results.length;
    const passed = results.filter(r => r.status === 'PASSED').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    const blocked = results.filter(r => r.status === 'BLOCKED').length;
    const skipped = results.filter(r => r.status === 'SKIPPED').length;

    const firstResult = results[0];
    const lastResult = results[results.length - 1];
    const duration = lastResult 
      ? new Date(lastResult.executedAt).getTime() - new Date(firstResult.executedAt).getTime()
      : 0;

    return {
      total,
      passed,
      failed,
      blocked,
      skipped,
      passRate: (passed / total) * 100,
      duration
    };
  }

  async generatePDF(report: TestRunReport): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Test Run Report', 14, 22);
    
    // Add metadata
    doc.setFontSize(12);
    doc.text(`Test Run: ${report.testRun.name}`, 14, 32);
    doc.text(`Status: ${report.testRun.status}`, 14, 40);
    doc.text(`Date: ${format(report.testRun.startedAt, 'PPP')}`, 14, 48);
    
    // Add statistics
    doc.setFontSize(14);
    doc.text('Statistics', 14, 60);
    doc.setFontSize(12);
    doc.text(`Total Tests: ${report.statistics.total}`, 14, 70);
    doc.text(`Pass Rate: ${report.statistics.passRate.toFixed(2)}%`, 14, 78);
    doc.text(`Duration: ${Math.round(report.statistics.duration / 1000 / 60)}min`, 14, 86);
    
    // Add results table
    (doc as any).autoTable({
      startY: 100,
      head: [['Test Case', 'Status', 'Executed By', 'Date', 'Notes']],
      body: report.results.map(result => [
        result.testCaseName,
        result.status,
        result.executedBy,
        format(result.executedAt, 'PP'),
        result.notes || ''
      ])
    });
    
    return Buffer.from(doc.output('arraybuffer'));
  }

  async generateCSV(report: TestRunReport): Promise<string> {
    const fields = [
      'testCaseName',
      'status',
      'executedBy',
      'executedAt',
      'notes'
    ];

    const parser = new Parser({
      fields,
      transforms: [
        (item: CSVTransformItem) => ({
          ...item,
          executedAt: format(new Date(item.executedAt), 'PPp')
        })
      ]
    });

    return parser.parse(report.results);
  }
} 