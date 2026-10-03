import fs from 'fs';
import path from 'path';

const root = process.cwd();
const targets = [
  'node_modules',
  path.join('backend', 'node_modules'),
  path.join('frontend', 'node_modules'),
  path.join('frontend', 'dist')
];

for (const target of targets) {
  const full = path.join(root, target);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true, force: true });
    console.log('Removed', target);
  }
}

console.log('Clean complete. Lockfiles and source files were preserved.');
