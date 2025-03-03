import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TestRunStatus } from '@/types';
import type { Session } from 'next-auth';
import type { UserRole } from '@/types/auth';
import { protect } from '@/lib/auth/protect';

// Define the USER_ROLES constant with proper type assertions
const USER_ROLES = {
  ADMIN: 'ADMIN' as UserRole,
  MANAGER: 'PROJECT_MANAGER' as UserRole,
  EDITOR: 'TESTER' as UserRole,
  VIEWER: 'USER' as UserRole
};

// Define the exact shape of the data we need for our reports
interface TestRunReport {
  id: string;
  name: string;
  completedAt: Date | null;
  createdAt: Date;
  metrics: {
    totalCases: number;
    passedCases: number;
    failedCases: number;
    skippedCases: number;
    passRate: number;
  };
}

/**
 * Handler for project reports
 */
async function handler(
  req: Request,
  context: { params: Record<string, string>; session: Session }
): Promise<NextResponse> {
  try {
    const projectId = context.params.projectId;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Only handle GET requests
    if (req.method !== 'GET') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Fetch test runs with proper type handling
    const testRunsData = await prisma.testRun.findMany({
      where: { 
        projectId,
        status: TestRunStatus.COMPLETED 
      },
      include: {
        testRunCases: {
          include: {
            testCase: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        }
      }
    });
    
    // Transform the data to create our reports
    const reports: TestRunReport[] = testRunsData.map((run) => {
      const totalCases = run.testRunCases.length;
      const passedCases = run.testRunCases.filter(c => c.status === 'PASSED').length;
      const failedCases = run.testRunCases.filter(c => c.status === 'FAILED').length;
      const skippedCases = run.testRunCases.filter(c => c.status === 'SKIPPED').length;
      
      const passRate = totalCases > 0 ? (passedCases / totalCases) * 100 : 0;
      
      return {
        id: run.id,
        name: run.name,
        completedAt: run.completedAt,
        createdAt: run.createdAt,
        metrics: {
          totalCases,
          passedCases,
          failedCases,
          skippedCases,
          passRate: Math.round(passRate * 100) / 100 // Round to 2 decimal places
        }
      };
    });
    
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error in reports handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the protected handler with proper role types
export const GET = protect(handler, {
  roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EDITOR],
  auditAction: 'VIEW_PROJECT_REPORTS'
});
