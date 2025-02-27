import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ReportService } from '@/lib/services/reportService';
import { dbLogger } from '@/lib/logger';
import { AppError } from '@/lib/errors';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new AppError('Unauthorized', 401); }

    const { runId, format = 'PDF' } = await _req.json();
    const reportService = new ReportService();
    const report = await reportService.generateTestRunReport(runId);

    let result;
    switch (format) {
      case 'PDF':
        result = await reportService.generatePDF(report);
        return new NextResponse(result, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="test-run-${runId}.pdf"` } });
      case 'JSON':
        return NextResponse.json(report);
      default:
        throw new AppError('Unsupported format', 400); }
  } catch (error) {
    dbLogger.error('Error generating report:', error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      ); }
    return createSuccessResponse({ error: 'Internal server error' }, { status: 500 }; }
}
