import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (['.git', 'node_modules', 'dist', '.astro', 'data', '.omo', '.omx', '.hermes'].includes(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, acc);
    else acc.push(path);
  }
  return acc;
}

test('pcc-ref build metadata is generated and internally consistent', () => {
  const path = join(root, 'src/data/pcc-ref-build.json');
  assert.equal(existsSync(path), true);
  const meta = JSON.parse(readFileSync(path, 'utf8'));
  assert.match(meta.pccRefCommit, /^[a-f0-9]{40}$/);
  assert.equal(meta.totalSources, meta.counts.apple + meta.counts.meta + meta.counts.google);
  assert.equal(meta.counts.apple, 42);
  assert.equal(meta.counts.meta, 7);
  assert.equal(meta.counts.google, 5);
});

test('publishable source files do not contain local absolute paths or secret assignments', () => {
  const scannedRoots = ['README.md', 'DESIGN.md', 'package.json', 'astro.config.mjs', 'src', 'scripts', '.github'];
  const files = scannedRoots.flatMap((name) => {
    const path = join(root, name);
    if (!existsSync(path)) return [];
    return statSync(path).isDirectory() ? walk(path) : [path];
  }).filter((file) => /\.(md|mjs|ts|css|json|yml|yaml)$/.test(file));
  const forbidden = [/\/Users\/sangwan\//, /(?:^|\n)\s*(?:[A-Z0-9_]*(?:TOKEN|PASSWORD|SECRET)[A-Z0-9_]*)\s*=/i];
  const offenders = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const pattern of forbidden) {
      if (pattern.test(text)) offenders.push(`${file}: ${pattern}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test('generated docs include homepage, projects, comparisons, concepts, and evidence explorer', () => {
  const required = [
    'src/content/docs/index.md',
    'src/content/docs/projects/apple/index.md',
    'src/content/docs/projects/meta/index.md',
    'src/content/docs/projects/google/index.md',
    'src/content/docs/compare/architecture-boundary/index.md',
    'src/content/docs/compare/transparency-and-verifiability/index.md',
    'src/content/docs/concepts/remote-attestation/index.md',
    'src/content/docs/evidence/index.md'
  ];
  for (const file of required) assert.equal(existsSync(join(root, file)), true, file);
});
