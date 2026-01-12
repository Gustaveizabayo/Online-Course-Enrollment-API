import prisma from '../database/prisma';

export abstract class BaseService {
  protected prisma = prisma;

  protected handleDatabaseError(error: any): never {
    if (error.code === 'P2002') {
      throw new Error('Unique constraint violation');
    }
    if (error.code === 'P2025') {
      throw new Error('Record not found');
    }
    throw error;
  }

  protected async transaction<T>(callback: () => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(callback);
  }
}
