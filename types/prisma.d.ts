import { Prisma } from '@prisma/client'

declare module '@prisma/client' {
  export interface PrismaClient {
    version: Prisma.VersionDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation>;
  }

  export interface Version {
    id: string;
    versionNumber: number;
    title: string;
    description: string;
    steps: string;
    expectedResult: string;
    status: string;
    priority: string;
    testCaseId: string;
    createdAt: Date;
  }
}

export {} 