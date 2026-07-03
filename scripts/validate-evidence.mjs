import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsRoot = join(root, 'src', 'content', 'docs');
const pccRoot = join(root, 'data', 'pcc-ref');

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (name === '.git' || name === 'node_modules' || name === 'dist' || name === '.astro') continue;
    if (statSync(path).isDirectory()) walk(path, acc);
    else acc.push(path);
  }
  return acc;
}

const docs = walk(docsRoot).filter((p) => p.endsWith('.md') || p.endsWith('.mdx'));
const errors = [];
let refCount = 0;

for (const doc of docs) {
  const text = readFileSync(doc, 'utf8');
  const matches = [...text.matchAll(/data-pcc-ref="([^"]+)"/g)];
  for (const match of matches) {
    refCount += 1;
    const sourcePath = match[1];
    if (sourcePath.includes('..') || sourcePath.startsWith('/')) {
      errors.push(`${relative(root, doc)} has unsafe source path ${sourcePath}`);
      continue;
    }
    if (!existsSync(join(pccRoot, sourcePath))) {
      errors.push(`${relative(root, doc)} references missing pcc-ref path ${sourcePath}`);
    }
  }
}

const metadata = JSON.parse(readFileSync(join(root, 'src', 'data', 'pcc-ref-build.json'), 'utf8'));
if (!metadata.pccRefCommit || metadata.pccRefCommit.length !== 40) errors.push('metadata missing 40-char pccRefCommit');
if (metadata.totalSources !== metadata.counts.apple + metadata.counts.meta + metadata.counts.google) errors.push('metadata totalSources mismatch');
if (metadata.counts.apple < 1 || metadata.counts.meta < 1 || metadata.counts.google < 1) errors.push('metadata vendor counts must be non-zero');
if (refCount < 10) errors.push(`expected at least 10 source-backed cards, found ${refCount}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Evidence validation passed: ${docs.length} docs, ${refCount} data-pcc-ref links.`);
