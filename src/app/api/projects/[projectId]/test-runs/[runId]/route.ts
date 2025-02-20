import { withAuth } from '@/lib/withAuth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { projectId: string; runId: string } }) {
    const { projectId, runId } = params;
    // ... existing logic ...
}

export async function POST(request: Request, { params }: { params: { projectId: string; runId: string } }) {
    const { projectId, runId } = params;
    // ... existing logic ...
} 