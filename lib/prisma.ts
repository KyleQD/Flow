import { PrismaClient } from '@/lib/generated/prisma'

declare global {
  var prisma: PrismaClient | undefined
}

function prismaClientSingleton() {
  if (typeof window !== 'undefined') {
    throw new Error('Prisma client cannot be used on the client side')
  }

  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient({
      log: ['error'],
    })
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
      })
    }
    return global.prisma
  }
}

export const prisma = prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    if (global.prisma) {
      await global.prisma.$disconnect()
    }
  })
} 