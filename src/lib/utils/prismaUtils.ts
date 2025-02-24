import { prisma } from '@/lib/prisma';
import { ErrorFactory } from '@/lib/errors/BaseError';
import type { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

type TransactionClient = Omit<PrismaClient, '$transaction' | '$connect' | '$disconnect' | '$on' | '$use' | '$extends'>;

type PrismaModel = {
  delete: (args: { where: Record<string, unknown> }) => Promise<unknown>;
};

export const prismaUtils = {
  async withTransaction<T>(
    operation: (tx: TransactionClient) => Promise<T>
  ): Promise<T> {
    try {
      return await prisma.$transaction(operation);
    } catch (error) {
      throw ErrorFactory.create('TRANSACTION_ERROR', 'Transaction failed', { cause: error });
    }
  },

  async safeDelete(
    model: PrismaModel,
    where: Record<string, unknown>
  ): Promise<boolean> {
    try {
      await model.delete({ where });
      return true;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}; 