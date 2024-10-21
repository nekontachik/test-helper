import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { apiErrorHandler } from '@/lib/apiErrorHandler';
import logger from '@/lib/logger';

interface TestRunResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestRunResponse>
) {
  try {
    if (req.method === 'GET') {
      const testRuns = await prisma.testRun.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({ success: true, data: testRuns });
    } else {
      res.setHeader('Allow', ['GET']);
      res
        .status(405)
        .json({ success: false, error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    logger.error('Error in test runs handler:', error);
    apiErrorHandler(res, error);
  }
}
