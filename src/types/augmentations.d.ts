import { Prisma } from '@prisma/client';

declare global {
  namespace PrismaJson {
    type ProjectCreateInput = Prisma.ProjectCreateInput & {
      userId?: string;
    };
    type ProjectUncheckedCreateInput = Prisma.ProjectUncheckedCreateInput & {
      userId?: string;
    };
  }
}

export {};
