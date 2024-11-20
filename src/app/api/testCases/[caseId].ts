import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/apiErrorHandler';
import logger from '@/lib/logger';

interface TestCaseResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestCaseResponse>
) {
  const { caseId } = req.query;

  if (typeof caseId !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid caseId' });
  }

  try {
    const testCase = await prisma.testCase.findUnique({
      where: { id: caseId },
    });

    if (!testCase) {
      return res
        .status(404)
        .json({ success: false, error: 'Test case not found' });
    }

    res.status(200).json({ success: true, data: testCase });
  } catch (error) {
    logger.error('Error in test case handler:', error);
    return handleApiError(error);
  }
}
