import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { runId, projectId } = req.query;

  if (typeof runId !== 'string' || typeof projectId !== 'string') {
    return res.status(400).json({ message: 'Invalid runId or projectId' });
  }

  if (req.method === 'GET') {
    try {
      const testCases = await prisma.testCase.findMany({
        where: {
          testRunCases: { some: { runId: runId } },
          projectId: projectId,
        },
      });
      logger.info(
        `Retrieved test cases for run ${runId} in project ${projectId}`
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
