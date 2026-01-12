import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define global Jest functions if they don't exist
declare const beforeAll: (fn: () => Promise<void> | void) => void;
declare const afterAll: (fn: () => Promise<void> | void) => void;
declare const beforeEach: (fn: () => Promise<void> | void) => void;

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.oTP.deleteMany();
  await prisma.user.deleteMany();
});
