/**
 * Script to remove deprecated auth files
 */
import * as fs from 'fs';
import * as path from 'path';

const filesToRemove = [
  'src/middleware/routeProtection.ts',
  'src/middleware/apiProtection.ts',
  'src/middleware/config.ts',
  'src/lib/api/routeProtection.ts',
  'src/lib/auth/withSimpleAuth.ts',
  'src/app/api/[...route]/middleware.ts',
  'src/app/api/[...route]/rateLimiter.ts',
  'src/lib/utils/apiErrorHandler.ts'
];

// Check if files exist and remove them
filesToRemove.forEach((file: string) => {
  const fullPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`Removed: ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('Cleanup complete!'); 