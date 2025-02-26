import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { TestReport, TestCase, TestCaseResultStatus } from '@/types';
import { formatDate } from '@/lib/utils/date';

interface TestReportStatistics {
  totalTests: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  passRate: number;
}

interface TestReportResult {
  testCaseId: string;
  status: TestCaseResultStatus;
  notes?: string;
  executedBy: string;
  executedAt: string;
  testCase: TestCase;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      startY: number;
      head: string[][];
      body: (string | number)[][];
      styles: { fontSize: number };
      headStyles: { fillColor: number[] };
    }) => jsPDF;
  }
}

export function generatePDF(report: TestReport & { statistics: TestReportStatistics; results: TestReportResult[] }): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Title
  doc.setFontSize(20);
  doc.text('Test Execution Report', pageWidth / 2, 20, { align: 'center' });

  // Report Info
  doc.setFontSize(12);
  doc.text(`Report Name: ${report.name}`, 20, 40);
  doc.text(`Generated: ${formatDate(report.createdAt)}`, 20, 50);
  if (report.description) {
    doc.text(`Description: ${report.description}`, 20, 60);
  }

  // Statistics
  doc.setFontSize(16);
  doc.text('Test Execution Statistics', 20, 80);
  doc.setFontSize(12);

  const { statistics: stats } = report;
  doc.text(`Total Tests: ${stats.totalTests}`, 20, 90);
  doc.text(`Pass Rate: ${stats.passRate.toFixed(1)}%`, 20, 100);
  doc.text(`Passed: ${stats.passed}`, 20, 110);
  doc.text(`Failed: ${stats.failed}`, 20, 120);
  doc.text(`Blocked: ${stats.blocked}`, 20, 130);
  doc.text(`Skipped: ${stats.skipped}`, 20, 140);

  // Results Table
  doc.setFontSize(16);
  doc.text('Test Results', 20, 160);
  
  const tableData = report.results.map((result) => [
    result.testCase.title,
    result.status,
    result.notes || '-',
    result.executedBy,
    formatDate(result.executedAt)
  ]);

  doc.autoTable({
    startY: 170,
    head: [['Test Case', 'Status', 'Notes', 'Executed By', 'Executed At']],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  doc.save(`test-report-${report.id}.pdf`);
} 