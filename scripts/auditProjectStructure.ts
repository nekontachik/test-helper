import fs from 'fs';
import path from 'path';

const rootDir = path.join(__dirname, '..');
const structureFile = path.join(rootDir, 'STRUCTURE.md');

function readStructureFile(): string[] {
  const content = fs.readFileSync(structureFile, 'utf8');
  const lines = content.split('\n');
  const structureStart = lines.findIndex(
    (line) => line.trim() === 'test-helper/'
  );
  const structureEnd = lines.findIndex(
    (line, index) => index > structureStart && line.trim() === ''
  );
  return lines.slice(structureStart, structureEnd).map((line) => line.trim());
}

function auditDirectory(
  dir: string,
  expectedStructure: string[],
  depth: number = 0
): string[] {
  const issues: string[] = [];
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const relativePath = path.relative(rootDir, fullPath);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const expectedDir = expectedStructure.find((line) =>
        line.endsWith(`${item}/`)
      );
      if (!expectedDir) {
        issues.push(`Unexpected directory: ${relativePath}`);
      } else {
        const subStructure = expectedStructure.slice(
          expectedStructure.indexOf(expectedDir) + 1
        );
        issues.push(...auditDirectory(fullPath, subStructure, depth + 1));
      }
    } else {
      const expectedFile = expectedStructure.find((line) =>
        line.endsWith(item)
      );
      if (!expectedFile) {
        issues.push(`Unexpected file: ${relativePath}`);
      }
    }
  });

  return issues;
}

function main() {
  const expectedStructure = readStructureFile();
  const issues = auditDirectory(rootDir, expectedStructure);

  if (issues.length === 0) {
    console.log('No structure issues found.');
  } else {
    console.log('Structure issues found:');
    issues.forEach((issue) => console.log(`- ${issue}`));
  }
}

main();
