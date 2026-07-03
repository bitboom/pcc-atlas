import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('..', import.meta.url).pathname;
const dataDir = join(root, 'src/data');

function readJson(name) {
  const path = join(dataDir, name);
  assert.equal(existsSync(path), true, `${name} should exist`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function assertSourceRef(ref, knownPaths, context) {
  assert.equal(typeof ref.path, 'string', `${context} sourceRef.path should be a string`);
  assert.ok(ref.path.length > 0, `${context} sourceRef.path should be nonempty`);
  assert.equal(ref.path.startsWith('/'), false, `${context} sourceRef.path should be repo-relative`);
  assert.equal(ref.path.includes('..'), false, `${context} sourceRef.path should not escape corpus`);
  assert.ok(knownPaths.has(ref.path), `${context} sourceRef.path should exist in source manifest: ${ref.path}`);
}

test('atlas generated manifests exist and describe the pinned corpus', () => {
  const sourceManifest = readJson('source-manifest.generated.json');
  const claims = readJson('claims.generated.json');
  const diagrams = readJson('diagrams.generated.json');
  const study = readJson('study.generated.json');

  assert.match(sourceManifest.pccRefCommit, /^[a-f0-9]{40}$/);
  assert.ok(sourceManifest.sources.length >= 54, 'source manifest should include primary sources');
  assert.ok(claims.claims.length >= 12, 'claims manifest should include project and comparison claims');
  assert.ok(diagrams.diagrams.length >= 6, 'diagram manifest should include overview/project/comparison diagrams');
  assert.ok(study.items.length >= 6, 'study manifest should include cards/quizzes/flow items');
});

test('every claim, diagram node/edge, and study item has resolvable sourceRefs', () => {
  const sourceManifest = readJson('source-manifest.generated.json');
  const knownPaths = new Set(sourceManifest.sources.map((source) => source.path));
  const claims = readJson('claims.generated.json').claims;
  const diagrams = readJson('diagrams.generated.json').diagrams;
  const study = readJson('study.generated.json').items;

  for (const claim of claims) {
    assert.ok(Array.isArray(claim.sourceRefs) && claim.sourceRefs.length > 0, `claim ${claim.id} should have sourceRefs`);
    for (const ref of claim.sourceRefs) assertSourceRef(ref, knownPaths, `claim ${claim.id}`);
  }

  for (const diagram of diagrams) {
    assert.ok(diagram.title, `diagram ${diagram.id} should have a title`);
    for (const node of diagram.nodes) {
      assert.ok(Array.isArray(node.sourceRefs) && node.sourceRefs.length > 0, `diagram ${diagram.id} node ${node.id} should have sourceRefs`);
      for (const ref of node.sourceRefs) assertSourceRef(ref, knownPaths, `diagram ${diagram.id} node ${node.id}`);
    }
    for (const edge of diagram.edges) {
      assert.ok(Array.isArray(edge.sourceRefs) && edge.sourceRefs.length > 0, `diagram ${diagram.id} edge ${edge.id} should have sourceRefs`);
      for (const ref of edge.sourceRefs) assertSourceRef(ref, knownPaths, `diagram ${diagram.id} edge ${edge.id}`);
    }
  }

  for (const item of study) {
    assert.ok(Array.isArray(item.sourceRefs) && item.sourceRefs.length > 0, `study item ${item.id} should have sourceRefs`);
    for (const ref of item.sourceRefs) assertSourceRef(ref, knownPaths, `study item ${item.id}`);
  }
});

test('unknown dimensions use the exact not-documented contract', () => {
  const manifests = [
    ...readJson('claims.generated.json').claims,
    ...readJson('diagrams.generated.json').diagrams.flatMap((diagram) => [...diagram.nodes, ...diagram.edges]),
    ...readJson('study.generated.json').items
  ];
  const unknowns = manifests.filter((item) => item.documentationStatus === 'not_documented');
  assert.ok(unknowns.length >= 1, 'at least one intentionally unknown dimension should be represented');
  for (const item of unknowns) {
    assert.equal(item.text || item.summary || item.label || item.answer, 'Not documented in ingested sources');
  }
});
