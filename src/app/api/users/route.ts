import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { apiResponse, errorResponse } from '@/lib/api/response';
import { paginationSchema } from '@/lib/validation/schema';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['USER', 'ADMIN'])
});

export async function POST(_req: NextRequest): Promise<Response> {
  try {
    const body = await _req.json();
    const data = createUserSchema.parse(body);

    // Hash the password before storing
    const hashedPassword = await hashPassword(data.password);

    // Create user with hashed password
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
        // Don't return the password
      }
    });

    return apiResponse(user);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function GET(_req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = _req.nextUrl;
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    });

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
          // Don't return passwords
        }
      }),
      prisma.user.count()
    ]);

    return apiResponse(users, {
      page,
      limit,
      total
    });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
