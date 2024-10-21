const fs = require('fs');
const path = require('path');

function findUndefinedPaths(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      findUndefinedPaths(filePath);
    } else if (
      stats.isFile() &&
      (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx'))
    ) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('path.relative(') || content.includes('relative(')) {
        console.log(`Check file: ${filePath}`);
      }
    }
  });
}

findUndefinedPaths('.');
