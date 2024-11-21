import { prisma } from '../src/lib/prisma';
import { hash } from 'bcryptjs';

async function main() {
  const password = await hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password,
      role: 'ADMIN',
    },
  });
  console.log({ user });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
