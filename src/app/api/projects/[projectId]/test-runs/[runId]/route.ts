import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';

export async function GET(
    _req: NextRequest,
    { params }: { params: { projectId: string; runId: string } }
): Promise<ApiResponse<unknown>> {
    try {
        const { projectId, runId } = params;
        
        const testRun = await prisma.testRun.findUnique({
            where: { 
                id: runId,
                projectId
            },
            include: { testRunCases: true }
        });
        
        if (!testRun) {
            return createErrorResponse('Test run not found', 'NOT_FOUND', 404);
        }
        
        return createSuccessResponse(testRun);
    } catch (error) {
        console.error('Error fetching test run:', error);
        return createErrorResponse('Failed to fetch test run', 'SERVER_ERROR', 500);
    }
}

export async function POST(
    _req: NextRequest,
    { params }: { params: { projectId: string; runId: string } }
): Promise<ApiResponse<unknown>> {
    try {
        const { projectId, runId } = params;
        const body = await _req.json();
        
        const updatedTestRun = await prisma.testRun.update({
            where: { 
                id: runId,
                projectId
            },
            data: body,
        });
        
        return createSuccessResponse(updatedTestRun);
    } catch (error) {
        console.error('Error updating test run:', error);
        return createErrorResponse('Failed to update test run', 'SERVER_ERROR', 500);
    }
} 