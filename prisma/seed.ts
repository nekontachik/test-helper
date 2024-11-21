import { prisma } from '../src/lib/prisma';
import { hash } from 'bcryptjs';
import { UserRole } from '../src/types/auth';

async function main() {
  // Clean up existing data
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // Create roles
  const roles = await Promise.all([
    prisma.role.create({
      data: { type: UserRole.ADMIN },
    }),
    prisma.role.create({
      data: { type: UserRole.MANAGER },
    }),
    prisma.role.create({
      data: { type: UserRole.EDITOR },
    }),
    prisma.role.create({
      data: { type: UserRole.VIEWER },
    }),
    prisma.role.create({
      data: { type: UserRole.USER },
    }),
  ]);

  // Create admin user
  const hashedPassword = await hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      status: 'ACTIVE',
    },
  });

  console.log('Seeding completed successfully');
  console.log('Admin user created:', adminUser.email);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 