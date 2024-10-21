import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/errors';
import { testCaseSchema } from '@/lib/validationSchemas';
import { Prisma } from '@prisma/client';
import { TestCaseStatus, TestCasePriority } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const testCases = await prisma.testCase.findMany();
    return NextResponse.json(testCases);
  } catch (error) {
    console.error('Error fetching test cases:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = await testCaseSchema.validate(body);

    const testCaseData: Prisma.TestCaseCreateInput = {
      title: validatedData.title,
      description: validatedData.description ?? '', // Use nullish coalescing
      expectedResult: validatedData.expectedResult ?? '', // Use nullish coalescing
      priority: validatedData.priority ?? TestCasePriority.MEDIUM,
      status: validatedData.status ?? TestCaseStatus.ACTIVE,
      project: {
        connect: { id: validatedData.projectId },
      },
    };

    const testCase = await prisma.testCase.create({
      data: testCaseData,
    });
    return NextResponse.json(testCase, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: 'Database error' }, { status: 400 });
    }
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }
    console.error('Error creating test case:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
