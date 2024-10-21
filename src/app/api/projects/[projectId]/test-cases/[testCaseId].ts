import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../../lib/prisma';
import { apiErrorHandler } from '../../../../../lib/apiErrorHandler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { projectId, testCaseId } = req.query;

  if (typeof projectId !== 'string' || typeof testCaseId !== 'string') {
    return res.status(400).json({ message: 'Invalid projectId or testCaseId' });
  }

  if (req.method === 'GET') {
    try {
      const testCase = await prisma.testCase.findUnique({
        where: {
          id: testCaseId,
          projectId: projectId,
        },
      });
      if (testCase) {
        res.status(200).json(testCase);
      } else {
        res.status(404).json({ message: 'Test case not found' });
      }
    } catch (error) {
      apiErrorHandler(res, error);
    }
  } else if (req.method === 'PUT') {
    // Handle update logic
  } else if (req.method === 'DELETE') {
    // Handle delete logic
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
