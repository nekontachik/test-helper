import { Prisma } from '@prisma/client';

declare module '@prisma/client' {
  namespace Prisma {
    interface ProjectCreateInput {
      title: string;
      description?: string | null;
      user: { connect: { id: string } };
    }
    interface ProjectUncheckedCreateInput {
      title: string;
      description?: string | null;
      userId: string;
    }
    interface ProjectWhereInput {
      userId?: string | Prisma.StringFilter<'Project'>;
    }
    interface ProjectInclude {
      user?: boolean | Prisma.UserArgs;
      testCases?: boolean | Prisma.TestCaseArgs;
      testSuites?: boolean | Prisma.TestSuiteArgs;
    }
  }
}
