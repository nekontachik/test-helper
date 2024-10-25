import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { testRunId, projectId } = req.query;

  if (typeof testRunId !== 'string' || typeof projectId !== 'string') {
    return res.status(400).json({ message: 'Invalid testRunId or projectId' });
  }

  if (req.method === 'GET') {
    try {
      const testCases = await prisma.testCase.findMany({
        where: {
          testRuns: { some: { id: testRunId } },
          projectId: projectId,
        },
      });
      logger.info(
        `Retrieved test cases for run ${testRunId} in project ${projectId}`
      );
      res.status(200).json(testCases);
    } catch (error) {
      logger.error('Error retrieving test cases:', error);
      res.status(500).json({ message: 'Error retrieving test cases' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
