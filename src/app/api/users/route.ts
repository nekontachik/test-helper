import { z } from 'zod';
import { validateRequest } from '@/middleware/validate';
import { apiResponse, errorResponse } from '@/lib/api/response';
import { paginationSchema } from '@/lib/validation/schema';

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['USER', 'ADMIN']),
});

export async function POST(request: Request) {
  // Validate request
  const validationResult = await validateRequest(request, {
    body: createUserSchema,
  });

  if (validationResult instanceof Response) {
    return validationResult;
  }

  try {
    const body = await request.json();
    const data = createUserSchema.parse(body);

    // Your business logic here
    const user = await prisma.user.create({
      data,
    });

    return apiResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: Request) {
  // Validate query parameters
  const validationResult = await validateRequest(request, {
    query: paginationSchema,
  });

  if (validationResult instanceof Response) {
    return validationResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.user.count(),
    ]);

    return apiResponse(users, {
      page,
      limit,
      total,
    });
  } catch (error) {
    return errorResponse(error);
  }
} 