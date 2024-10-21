import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../../../lib/prisma';
import { apiErrorHandler } from '../../../../../../lib/apiErrorHandler';
import { TestCase } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId, testRunId } = req.query;

  if (req.method === 'GET') {
    try {
      const testRun = await prisma.testRun.findUnique({
        where: {
          id: String(testRunId),
          projectId: String(projectId),
        },
        include: { testCases: true },
      });

      if (!testRun) {
        return res.status(404).json({ message: 'Test run not found' });
      }

      const rows = testRun.testCases.map((testCase: TestCase) => [
        testCase.id,
        testCase.title,
        testCase.description || '',
        testCase.status,
        testCase.priority,
      ]);

      const exportData = {
        id: testRun.id,
        name: testRun.name,
        status: testRun.status,
        testCases: testRun.testCases.map((tc) => ({
          id: tc.id,
          title: tc.title,
          status: tc.status,
        })),
      };

      res.status(200).json(exportData);
    } catch (error) {
      apiErrorHandler(res, error);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
