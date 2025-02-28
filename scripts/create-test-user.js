const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Starting test user creation script');
    
    const testEmail = 'test@example.com';
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (existingUser) {
      console.log(`Test user already exists: ${testEmail}`);
      return;
    }
    
    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Test User',
        status: 'ACTIVE'
      }
    });
    
    console.log(`Test user created successfully: ${testEmail}`);
  } catch (error) {
    console.error('Failed to create test user:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Script completed');
  }
}

createTestUser(); 