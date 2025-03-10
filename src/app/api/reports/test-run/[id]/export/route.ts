import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { protect } from '@/lib/auth/protect';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/api/errorHandler';
import type { AuthenticatedRequest } from '@/lib/auth/withAuth';
import { ReportService } from '@/lib/services/reportService';
import type { TestRunReport, TestRunStatistics, TestResult, TestRunStatus } from '@/types/report';

// @ts-expect-error - The protect function expects NextRequest but we're using AuthenticatedRequest
export const GET = protect(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const testRunId = params.id;
    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'pdf';
    
    // Find the test report for this test run
    const testReport = await prisma.testReport.findFirst({
      where: { runId: testRunId },
      include: {
        testRun: {
          select: {
            name: true,
            status: true,
            startTime: true,
            completedAt: true,
          },
        },
      },
    });
    
    if (!testReport) {
      return NextResponse.json(
        { error: 'Test report not found' },
        { status: 404 }
      );
    }
    
    const reportService = new ReportService();
    
    // Create a properly typed report object
    const report: TestRunReport = {
      testRun: {
        id: testRunId,
        name: testReport.name,
        startedAt: new Date(testReport.createdAt),
        ...(testReport.testRun?.completedAt && { completedAt: new Date(testReport.testRun.completedAt) }),
        status: (testReport.testRun?.status || 'COMPLETED') as TestRunStatus,
      },
      statistics: JSON.parse(JSON.stringify(testReport.statistics)) as TestRunStatistics,
      results: JSON.parse(JSON.stringify(testReport.results)) as TestResult[],
    };
    
    // Generate the report in the requested format
    if (format.toLowerCase() === 'pdf') {
      const pdfBuffer = await reportService.generatePDF(report);
      
      logger.info(`PDF report for test run ${testRunId} exported by user ${req.user.id}`, {
        userId: req.user.id,
        testRunId,
        reportId: testReport.id,
      });
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="test-run-report-${testRunId}.pdf"`,
        },
      });
    } else if (format.toLowerCase() === 'csv') {
      const csvContent = await reportService.generateCSV(report);
      
      logger.info(`CSV report for test run ${testRunId} exported by user ${req.user.id}`, {
        userId: req.user.id,
        testRunId,
        reportId: testReport.id,
      });
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="test-run-report-${testRunId}.csv"`,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Supported formats: pdf, csv' },
        { status: 400 }
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}); 