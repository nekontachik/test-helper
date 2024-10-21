import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { validateTestSuite } from '@/lib/validationSchemas';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const projectId = req.query.projectId as string;

  switch (method) {
    case 'GET':
      try {
        const testSuites = await prisma.testSuite.findMany({
          where: { projectId },
        });
        res.status(200).json(testSuites);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch test suites' });
      }
      break;

    case 'POST':
      try {
        const validationResult = await validateTestSuite(req.body);
        if (!validationResult.isValid) {
          return res.status(400).json({ errors: validationResult.errors });
        }

        const testSuite = await prisma.testSuite.create({
          data: {
            ...req.body,
            projectId,
          },
        });
        res.status(201).json(testSuite);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create test suite' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
