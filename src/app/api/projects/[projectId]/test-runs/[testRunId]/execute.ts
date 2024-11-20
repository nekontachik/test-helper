import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authorizeMiddleware } from '@/lib/authorize';
import { withMiddleware } from '@/lib/withMiddleware';
import { TestRunStatus } from '@/types';
import logger from '@/lib/logger';

export default withMiddleware(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const { projectId, testRunId } = req.query;

    if (typeof projectId !== 'string' || typeof testRunId !== 'string') {
      return res
        .status(400)
        .json({ message: 'Invalid projectId or testRunId' });
    }

    if (req.method === 'POST') {
      await new Promise<void>((resolve, reject) => {
        authorizeMiddleware(['admin', 'user'])(req, res, (error?: Error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      try {
        const updatedTestRun = await prisma.testRun.update({
          where: { id: testRunId },
          data: { status: TestRunStatus.IN_PROGRESS },
          include: { 
            testRunCases: {
              include: {
                testCase: true
              }
            }
          },
        });

        logger.info(
          `Test run ${testRunId} for project ${projectId} has been executed`
        );
        res.status(200).json({ success: true, data: updatedTestRun });
      } catch (error) {
        logger.error(
          `Error executing test run ${testRunId} for project ${projectId}:`,
          error
        );
        res
          .status(500)
          .json({ success: false, error: 'Failed to execute test run' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({
        success: false,
        error: { message: `Method ${req.method} Not Allowed` },
      });
    }
  }
);
