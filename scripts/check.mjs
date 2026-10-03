import { execFileSync } from 'child_process';
import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';

const root = process.cwd();
const required = [
  'README.md',
  '.gitignore',
  'backend/.env.example',
  'frontend/.env.example',
  'backend/src/server.js',
  'backend/src/config.js',
  'frontend/src/App.jsx',
  '.github/workflows/ci.yml'
];

for (const file of required) {
  const full = path.join(root, file);
  try {
    statSync(full);
  } catch {
    throw new Error(`Required repository file is missing: ${file}`);
  }
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const backendJs = walk(path.join(root, 'backend', 'src')).filter((file) => file.endsWith('.js'));
for (const file of backendJs) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
}

const authSource = readFileSync(path.join(root, 'backend', 'src', 'routes', 'auth.js'), 'utf8');
const middlewareSource = readFileSync(path.join(root, 'backend', 'src', 'middleware', 'auth.js'), 'utf8');
if (authSource.includes("localexpress_secret") || middlewareSource.includes("localexpress_secret")) {
  throw new Error('Hard-coded JWT fallback secret detected.');
}

console.log(`Repository checks passed: ${backendJs.length} backend JavaScript files validated.`);
