import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;

function runValidate(env = {}) {
  return spawnSync(process.execPath, ['scripts/validate-evidence.mjs'], {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: 'utf8'
  });
}

test('validate:evidence passes with local corpus and generated-only mode', () => {
  const local = runValidate();
  assert.equal(local.status, 0, `${local.stdout}\n${local.stderr}`);
  const generatedOnly = runValidate({ PCC_REF_DIR: join(tmpdir(), 'definitely-missing-pcc-ref'), PCC_ATLAS_ALLOW_MISSING_PCC_REF: '1' });
  assert.equal(generatedOnly.status, 0, `${generatedOnly.stdout}\n${generatedOnly.stderr}`);
});

test('validate:evidence rejects missing corpus unless generated-only mode is explicit', () => {
  const result = runValidate({ PCC_REF_DIR: join(tmpdir(), 'definitely-missing-pcc-ref'), PCC_ATLAS_ALLOW_MISSING_PCC_REF: '' });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /pcc-ref corpus not found/);
});

test('validator module rejects unsafe or empty sourceRefs in fixtures', async () => {
  const { validateAtlasData } = await import('../scripts/lib/evidence-validator.mjs');
  const goodSources = [{ path: 'apple/wiki/sources/apple-private-cloud-compute/corerequirements.md', title: 'Core Requirements' }];
  const errors = validateAtlasData({
    sourceManifest: { sources: goodSources },
    claimsManifest: { claims: [{ id: 'bad-claim', summary: 'bad', sourceRefs: [{ path: '../escape.md' }] }] },
    diagramsManifest: { diagrams: [{ id: 'bad-diagram', nodes: [{ id: 'n1', label: 'n1', sourceRefs: [] }], edges: [] }] },
    studyManifest: { items: [{ id: 'bad-study', type: 'quiz', question: 'q', answer: 'a', sourceRefs: [{ path: '/absolute.md' }] }] }
  });
  assert.ok(errors.some((error) => error.includes('unsafe sourceRef')));
  assert.ok(errors.some((error) => error.includes('empty sourceRefs')));
});

test('generated docs are diagram-first and expose study interactions', () => {
  const requiredPages = [
    'src/content/docs/index.mdx',
    'src/content/docs/projects/apple/index.mdx',
    'src/content/docs/projects/meta/index.mdx',
    'src/content/docs/projects/google/index.mdx',
    'src/content/docs/study/index.mdx'
  ];
  for (const page of requiredPages) {
    const path = join(root, page);
    assert.equal(existsSync(path), true, `${page} should exist`);
    const text = readFileSync(path, 'utf8');
    assert.match(text, /Diagram|StudyCards|Quiz|FlowStepper|CitationDrawer/, `${page} should use atlas components`);
  }
});
