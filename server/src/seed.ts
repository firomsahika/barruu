import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@siidaabarruu.com' },
    update: {},
    create: {
      email: 'admin@siidaabarruu.com',
      username: 'admin',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  
  console.log('Seed completed', { admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
