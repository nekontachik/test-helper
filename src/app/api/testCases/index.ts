import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { testCaseSchema } from '@/lib/validationSchemas';
import { TestCaseStatus, TestCasePriority } from '@/types';

// Import the correct error type from Prisma
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const testCases = await prisma.testCase.findMany();
        res.status(200).json(testCases);
      } catch (error) {
        console.error('Error fetching test cases:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
      break;

    case 'POST':
      try {
        const validatedData = await testCaseSchema.validate(req.body);

        // Use a more specific type that matches your schema
        const testCaseData = {
          title: validatedData.title,
          description: validatedData.description ?? '',
          expectedResult: validatedData.expectedResult ?? '',
          priority: (validatedData.priority as TestCasePriority)?.toString() || TestCasePriority.MEDIUM.toString(),
          status: (validatedData.status as TestCaseStatus)?.toString() || TestCaseStatus.ACTIVE.toString(),
          author: {
            connect: { id: req.body.userId }
          },
          project: {
            connect: { id: validatedData.projectId }
          }
        };

        const testCase = await prisma.testCase.create({
          data: testCaseData,
        });
        res.status(201).json(testCase);
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          res.status(400).json({ error: 'Database error' });
        } else if (error instanceof ApiError) {
          res.status(error.statusCode).json({ error: error.message });
        } else {
          console.error('Error creating test case:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
