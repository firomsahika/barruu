import { prisma } from '../lib/prisma';

/**
 * Ephemeral Test Database Lifecycle Manager
 * Truncates relational tables between test suites when running against a live test DB.
 */
export async function setupTestDatabase(): Promise<void> {
  if (process.env.DATABASE_URL?.includes('test')) {
    try {
      const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables WHERE schemaname='public';
      `;
      const tables = tablenames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== '_prisma_migrations')
        .map((name) => `"public"."${name}"`)
        .join(', ');

      if (tables.length > 0) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
      }
    } catch {
      // Ignored if test DB is in-memory or connection not active
    }
  }
}

export async function teardownTestDatabase(): Promise<void> {
  await prisma.$disconnect();
}
