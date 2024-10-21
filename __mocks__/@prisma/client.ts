export const PrismaClient = jest.fn().mockImplementation(() => ({
  // Add mock implementations for Prisma methods as needed
  testRun: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  testSuite: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  testCase: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));
