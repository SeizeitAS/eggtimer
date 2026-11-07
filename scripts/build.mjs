// Samler de filene som skal ut på webserveren i mappen dist/.
// Kjøres med: npm run build
// Resultatet er statiske filer. Last opp hele innholdet i dist/ til webroten (eller undermappen) på serveren.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');

const include = ['index.html', 'hjelp.html', 'css', 'js', 'lang', 'data', 'help'];

function countFiles(dir) {
  return readdirSync(dir).reduce((sum, name) => {
    const path = join(dir, name);
    return sum + (statSync(path).isDirectory() ? countFiles(path) : 1);
  }, 0);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const item of include) {
  const from = join(root, item);
  if (!existsSync(from)) {
    throw new Error(`Mangler ${item}`);
  }
  cpSync(from, join(out, item), { recursive: true });
}

console.log(`Bygget dist/ med ${countFiles(out)} filer.`);
