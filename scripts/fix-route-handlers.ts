import * as fs from 'fs';
import * as path from 'path';

const routeDir = path.join(process.cwd(), 'src', 'app', 'api');

function fixRouteHandler(content: string): string {
  // Remove all NextResponse imports first
  content = content.replace(/import.*NextResponse.*from ['"]next\/server['"].*;\n?/g, '');
  
  // Fix imports - ensure proper order and no duplicates
  const imports = [
    `import { type NextRequest } from 'next/server';`,
    `import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';`
  ];
  
  // Remove existing imports we're going to replace
  content = content.replace(/import.*NextRequest.*from ['"]next\/server['"].*;\n?/g, '');
  content = content.replace(/import.*createSuccessResponse.*from ['"]@\/types\/api['"].*;\n?/g, '');
  content = content.replace(/import.*ApiResponse.*from ['"]@\/types\/api['"].*;\n?/g, '');
  
  // Add our imports at the top
  content = `${imports.join('\n')}\n${content}`;

  // Remove unused imports
  content = content.replace(/import\s*{\s*[^}]*generateTOTPConfig[^}]*}\s*from\s*['"][^'"]+['"];\n/g, '');

  // Fix handler declarations with proper formatting
  const handlers = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
  handlers.forEach(method => {
    const handlerRegex = new RegExp(
      `export\\s+(async\\s+)?function\\s+${method}\\s*\\([^)]*\\)\\s*(?::\\s*[^{]+)?\\s*{`,
      'g'
    );
    content = content.replace(
      handlerRegex,
      `export async function ${method}(_req: NextRequest): Promise<ApiResponse<unknown>> {`
    );
  });

  // Fix request parameter references
  content = content.replace(/(?<!\w)req\./g, '_req.');
  content = content.replace(/request\./g, '_req.');

  // Fix error responses - convert createSuccessResponse with error to createErrorResponse
  content = content.replace(
    /createSuccessResponse\(\s*{\s*error:\s*([^}]+)}\s*,\s*{\s*status:\s*(\d+)\s*}\s*\);?\s*}/g,
    (_, error, status) => `createErrorResponse(${error}, 'ERROR_CODE', ${status});\n  }`
  );

  // Fix NextResponse.json calls
  content = content.replace(
    /NextResponse\.json\(\s*{\s*(?:error:|message:)\s*['"]([^'"]+)['"]\s*}(?:\s*,\s*{\s*status:\s*(\d+)\s*})?\s*\)/g,
    (_, message, status) => `createErrorResponse('${message}'${status ? `, 'ERROR_CODE', ${status}` : ''})`
  );

  content = content.replace(
    /NextResponse\.json\(\s*{([^}]+)}\s*(?:,\s*{\s*status:\s*(\d+)\s*})?\s*\)/g,
    (_, data, status) => `createSuccessResponse({${data}}${status ? `, { status: ${status} }` : ''})`
  );

  // Fix empty handlers
  content = content.replace(
    /export async function \w+\([^)]+\)[^{]*{\s*\/\/[^\n]*\n\s*\/\/[^\n]*\n\s*}/g,
    match => `${match.split('\n')[0]}\n  throw new Error('Not implemented');\n}`
  );

  // Fix formatting
  content = content.replace(/}\s*}\s*catch/g, '}\n  } catch');
  content = content.replace(/}\s*}\s*$/gm, '}\n}\n');
  content = content.replace(/,\s*}\s*\)/g, ' })');
  content = content.replace(/{\s*\n\s*}/g, '{ }');
  content = content.replace(/,\s*}\s*;/g, ' }');
  content = content.replace(/\n{3,}/g, '\n\n');
  content = content.replace(/;\s*}/g, '\n}');
  content = content.replace(/}\s*;/g, '}');

  return content;
}

// Process a single file
function processFile(filePath: string): void {
  if (filePath.endsWith('route.ts')) {
    console.log(`Processing ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = fixRouteHandler(content);
    fs.writeFileSync(filePath, fixed);
  }
}

// Process directory recursively
function processDirectory(dir: string): void {
  const files = fs.readdirSync(dir);
  
  files.forEach((file: string) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else {
      processFile(fullPath);
    }
  });
}

// Run the script
console.log('Fixing route handlers...');
processDirectory(routeDir);
console.log('Done!'); 