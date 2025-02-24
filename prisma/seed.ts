import { prisma } from '../src/lib/prisma';
import { hash } from 'bcryptjs';
import { Prisma } from '@prisma/client';
import type { Role, User } from '@prisma/client';

const UserRole = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  TESTER: 'TESTER',
  USER: 'USER',
  GUEST: 'GUEST'
} as const;

type UserRoleType = typeof UserRole[keyof typeof UserRole];

interface SeedUser {
  email: string;
  name: string;
  password: string;
  role: UserRoleType;
}

const ADMIN_USER: SeedUser = {
  email: 'admin@example.com',
  name: 'Admin User',
  password: 'admin123',
  role: UserRole.ADMIN,
};

async function createRole(type: UserRoleType): Promise<Role> {
  try {
    return await prisma.role.create({
      data: { type }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return prisma.role.findUniqueOrThrow({
        where: { type }
      });
    }
    throw error;
  }
}

async function createUser(data: SeedUser): Promise<User> {
  const hashedPassword = await hash(data.password, 12);
  
  try {
    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role,
        emailVerified: new Date(),
        status: 'ACTIVE',
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      console.log(`User with email ${data.email} already exists`);
      return prisma.user.findUniqueOrThrow({
        where: { email: data.email }
      });
    }
    throw error;
  }
}

async function cleanDatabase() {
  // Delete in correct order to handle foreign key constraints
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.role.deleteMany(),
  ]);
}

async function main() {
  console.log('Starting database seed...');

  // Clean up existing data
  await cleanDatabase();

  // Create roles
  console.log('Creating roles...');
  const roles = await Promise.all(
    Object.values(UserRole).map(role => createRole(role))
  );
  console.log(`Created ${roles.length} roles`);

  // Create admin user
  console.log('Creating admin user...');
  const adminUser = await createUser(ADMIN_USER);
  console.log('Admin user created:', adminUser.email);

  console.log('Seeding completed successfully');
}

main()
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 