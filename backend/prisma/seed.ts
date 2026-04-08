import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  // Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@task.com' },
    update: {},
    create: {
      email: 'admin@task.com',
      name: 'System Administrator',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Create Regular User
  await prisma.user.upsert({
    where: { email: 'user@task.com' },
    update: {},
    create: {
      email: 'user@task.com',
      name: 'Regular User',
      password: userPassword,
      role: Role.USER,
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
