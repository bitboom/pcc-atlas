import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const NOT_DOCUMENTED_TEXT = 'Not documented in ingested sources';

export function repoRootFrom(importMetaUrl = import.meta.url) {
  return join(dirname(fileURLToPath(importMetaUrl)), '..');
}

export function resolvePccRoot(root, env = process.env) {
  const candidates = env.PCC_REF_DIR
    ? [env.PCC_REF_DIR]
    : [join(root, '..', 'pcc-ref'), join(root, 'data', 'pcc-ref')];
  return {
    candidates,
    root: candidates.find((candidate) => existsSync(join(candidate, 'apple', 'sources.json')))
  };
}

export function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (['.git', 'node_modules', 'dist', '.astro', '.omo', '.omx', '.hermes'].includes(name)) continue;
    if (statSync(path).isDirectory()) walk(path, acc);
    else acc.push(path);
  }
  return acc;
}

export function readJsonIfExists(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function isUnsafePath(path) {
  return !path || path.startsWith('/') || path.includes('..') || path.includes('\\\0');
}

function visibleUnknownText(item) {
  return item.text ?? item.summary ?? item.label ?? item.answer ?? item.value;
}

function collectRefs(item) {
  return Array.isArray(item?.sourceRefs) ? item.sourceRefs : [];
}

function validateRefs(errors, refs, knownPaths, context) {
  if (!Array.isArray(refs) || refs.length === 0) {
    errors.push(`${context} has empty sourceRefs`);
    return;
  }
  for (const ref of refs) {
    const sourcePath = ref?.path;
    if (isUnsafePath(sourcePath)) {
      errors.push(`${context} has unsafe sourceRef ${sourcePath ?? '<empty>'}`);
      continue;
    }
    if (knownPaths && !knownPaths.has(sourcePath)) {
      errors.push(`${context} references source not in manifest: ${sourcePath}`);
    }
  }
}

function validateUnknown(errors, item, context) {
  if (item?.documentationStatus === 'not_documented' && visibleUnknownText(item) !== NOT_DOCUMENTED_TEXT) {
    errors.push(`${context} uses documentationStatus=not_documented without exact visible text "${NOT_DOCUMENTED_TEXT}"`);
  }
}

export function validateAtlasData({ sourceManifest, claimsManifest, diagramsManifest, studyManifest }) {
  const errors = [];
  const sources = sourceManifest?.sources || [];
  const knownPaths = new Set(sources.map((source) => source.path));

  if (!sourceManifest?.pccRefCommit || !/^[a-f0-9]{40}$/.test(sourceManifest.pccRefCommit)) {
    errors.push('source manifest missing 40-char pccRefCommit');
  }
  if (sources.length < 1) errors.push('source manifest has no sources');
  for (const source of sources) {
    if (isUnsafePath(source.path)) errors.push(`source manifest has unsafe source path ${source.path ?? '<empty>'}`);
    if (!source.title) errors.push(`source manifest source ${source.path} has no title`);
  }

  for (const claim of claimsManifest?.claims || []) {
    const context = `claim ${claim.id || '<missing-id>'}`;
    validateRefs(errors, collectRefs(claim), knownPaths, context);
    validateUnknown(errors, claim, context);
  }

  for (const diagram of diagramsManifest?.diagrams || []) {
    if (!diagram.id) errors.push('diagram missing id');
    if (!diagram.title) errors.push(`diagram ${diagram.id || '<missing-id>'} missing title`);
    for (const node of diagram.nodes || []) {
      const context = `diagram ${diagram.id} node ${node.id || '<missing-id>'}`;
      validateRefs(errors, collectRefs(node), knownPaths, context);
      validateUnknown(errors, node, context);
    }
    for (const edge of diagram.edges || []) {
      const context = `diagram ${diagram.id} edge ${edge.id || '<missing-id>'}`;
      validateRefs(errors, collectRefs(edge), knownPaths, context);
      validateUnknown(errors, edge, context);
    }
  }

  for (const item of studyManifest?.items || []) {
    const context = `study item ${item.id || '<missing-id>'}`;
    validateRefs(errors, collectRefs(item), knownPaths, context);
    validateUnknown(errors, item, context);
  }

  return errors;
}

export function validateDocs({ root, docsRoot, pccRoot, allowMissingPccRef }) {
  const errors = [];
  let refCount = 0;
  const docs = walk(docsRoot).filter((p) => p.endsWith('.md') || p.endsWith('.mdx'));
  for (const doc of docs) {
    const text = readFileSync(doc, 'utf8');
    const attrMatches = [...text.matchAll(/data-(?:pcc-ref|source-ref)="([^"]+)"/g)];
    for (const match of attrMatches) {
      refCount += 1;
      const sourcePath = match[1];
      if (isUnsafePath(sourcePath)) {
        errors.push(`${relative(root, doc)} has unsafe source path ${sourcePath}`);
        continue;
      }
      if (pccRoot && !existsSync(join(pccRoot, sourcePath))) {
        errors.push(`${relative(root, doc)} references missing pcc-ref path ${sourcePath}`);
      }
    }
  }
  return { docs, errors, refCount };
}
