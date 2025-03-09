import * as fs from 'fs';
import { execSync } from 'child_process';

// Find all files with the old import pattern
const findCommand = "grep -r --include='*.ts' --include='*.tsx' '@/lib/utils/logger' src";
const files = execSync(findCommand).toString().split('\n');

// Process each file
files.forEach(line => {
  if (!line) return;
  
  // Extract file path
  const filePath = line.split(':')[0];
  if (!filePath || !fs.existsSync(filePath)) return;
  
  console.log(`Processing ${filePath}...`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace imports
  content = content.replace(/import\s+{\s*logger\s*}\s+from\s+['"]@\/lib\/utils\/logger['"];?/g, 
                           `import { logger } from '@/lib/logger';`);
  
  content = content.replace(/import\s+logger\s+from\s+['"]@\/lib\/utils\/logger['"];?/g, 
                           `import { logger } from '@/lib/logger';`);
  
  content = content.replace(/import\s+{\s*logInfo,\s*logError\s*}\s+from\s+['"]@\/lib\/utils\/logger['"];?/g, 
                           `import { logger } from '@/lib/logger';`);
  
  // Update jest mocks
  content = content.replace(/jest\.mock\(['"]@\/lib\/utils\/logger['"]\)/g, 
                           `jest.mock('@/lib/logger')`);
  
  // Write updated content back to file
  fs.writeFileSync(filePath, content);
  
  console.log(`Updated ${filePath}`);
});

console.log('All logger imports have been updated!'); 