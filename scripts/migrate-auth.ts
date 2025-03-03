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

console.log('Migration complete!'); 