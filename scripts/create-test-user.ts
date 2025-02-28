const { AuthService } = require('../src/lib/services/auth.service');
const logger = require('../src/lib/utils/logger').default;

async function main(): Promise<void> {
  try {
    logger.info('Starting test user creation script');
    await AuthService.createTestUser();
    logger.info('Test user creation script completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error in test user creation script', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

main(); 