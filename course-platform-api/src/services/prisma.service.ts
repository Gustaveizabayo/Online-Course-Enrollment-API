import { PrismaClient } from '@prisma/client'

// For Prisma 7+, we need to pass the datasource URL
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Handle cleanup on exit
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
