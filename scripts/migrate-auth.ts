/**
 * Script to migrate API routes to the new auth system
 */
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Find all API route files
const apiRoutes = glob.sync('src/app/api/**/*.ts');

// Patterns to search for
const patterns = [
  { regex: /withAuth\(/g, replacement: 'protect(' },
  { regex: /withProtect\(/g, replacement: 'protect(' },
  { regex: /withProtectedRoute\(/g, replacement: 'protect(' },
  { regex: /createProtectedRoute\(/g, replacement: 'protect(' },
  { regex: /import.*from ['"]@\/lib\/utils\/apiErrorHandler['"]/g, 
    replacement: 'import { handleApiError } from \'@/lib/api/errorHandler\'' },
  { regex: /import.*from ['"]@\/lib\/utils\/logger['"]/g,
    replacement: 'import { logger } from \'@/lib/logger\'' },
  // Add pattern for ApiErrorHandler.handle
  { regex: /ApiErrorHandler\.handle\(/g, replacement: 'handleApiError(' },
  // Add pattern for ApiError imports
  { regex: /import.*from ['"]@\/lib\/errors\/ApiError['"]/g,
    replacement: 'import { CustomError } from \'@/lib/errors/ErrorFactory\'' },
  // Add pattern for old error factory
  { regex: /ErrorFactory\.create\(/g, replacement: 'new CustomError(' },
];

// Process each file
apiRoutes.forEach((file: string) => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  patterns.forEach(({ regex, replacement }) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`Updated: ${file}`);
  }
});

// Add a check for files that might need manual review
const manualReviewPatterns = [
  /allowedRoles/g,
  /requiredRoles/g,
  /requireAuth/g,
  /ApiErrorHandler/g,
  /ErrorFactory/g
];

const filesNeedingManualReview: string[] = [];

apiRoutes.forEach((file: string) => {
  const content = fs.readFileSync(file, 'utf8');
  
  for (const pattern of manualReviewPatterns) {
    if (pattern.test(content)) {
      filesNeedingManualReview.push(file);
      break;
    }
  }
});

if (filesNeedingManualReview.length > 0) {
  console.log('\nThe following files may need manual review:');
  filesNeedingManualReview.forEach(file => console.log(`- ${file}`));
}

console.log('Migration complete!'); 