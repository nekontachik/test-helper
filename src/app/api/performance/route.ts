import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey || apiKey !== process.env.PERFORMANCE_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse the performance data
    const performanceData = await req.json();
    
    // Log the performance data
    logger.info('Performance metric received', {
      metric: performanceData,
      userAgent: req.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
    });
    
    // Store in database if needed
    // await db.performanceMetrics.create({ data: performanceData });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error processing performance data', { error });
    
    return NextResponse.json(
      { error: 'Failed to process performance data' },
      { status: 500 }
    );
  }
} 