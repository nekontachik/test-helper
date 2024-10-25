const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

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
