import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  readJsonIfExists,
  repoRootFrom,
  resolvePccRoot,
  validateAtlasData,
  validateDocs
} from './lib/evidence-validator.mjs';

const root = repoRootFrom(import.meta.url);
const docsRoot = join(root, 'src', 'content', 'docs');
const dataRoot = join(root, 'src', 'data');
const { root: pccRoot, candidates } = resolvePccRoot(root);
const allowMissingPccRef = process.env.PCC_ATLAS_ALLOW_MISSING_PCC_REF === '1';
const errors = [];

if (!pccRoot && !allowMissingPccRef) {
  errors.push(`pcc-ref corpus not found. Set PCC_REF_DIR or set PCC_ATLAS_ALLOW_MISSING_PCC_REF=1 for generated-only CI validation. Tried: ${candidates.join(', ')}`);
}

const metadata = readJsonIfExists(join(dataRoot, 'pcc-ref-build.json'));
if (!metadata) {
  errors.push('missing src/data/pcc-ref-build.json');
} else {
  if (!metadata.pccRefCommit || metadata.pccRefCommit.length !== 40) errors.push('metadata missing 40-char pccRefCommit');
  if (metadata.totalSources !== metadata.counts.apple + metadata.counts.meta + metadata.counts.google) errors.push('metadata totalSources mismatch');
  if (metadata.counts.apple < 1 || metadata.counts.meta < 1 || metadata.counts.google < 1) errors.push('metadata vendor counts must be non-zero');
}

const sourceManifest = readJsonIfExists(join(dataRoot, 'source-manifest.generated.json'));
const claimsManifest = readJsonIfExists(join(dataRoot, 'claims.generated.json'));
const diagramsManifest = readJsonIfExists(join(dataRoot, 'diagrams.generated.json'));
const studyManifest = readJsonIfExists(join(dataRoot, 'study.generated.json'));

if (!sourceManifest) errors.push('missing src/data/source-manifest.generated.json');
if (!claimsManifest) errors.push('missing src/data/claims.generated.json');
if (!diagramsManifest) errors.push('missing src/data/diagrams.generated.json');
if (!studyManifest) errors.push('missing src/data/study.generated.json');

if (sourceManifest && claimsManifest && diagramsManifest && studyManifest) {
  errors.push(...validateAtlasData({ sourceManifest, claimsManifest, diagramsManifest, studyManifest }));
  if (pccRoot) {
    for (const source of sourceManifest.sources || []) {
      if (!existsSync(join(pccRoot, source.path))) errors.push(`source manifest references missing pcc-ref path ${source.path}`);
    }
  }
}

const docsResult = validateDocs({ root, docsRoot, pccRoot, allowMissingPccRef });
errors.push(...docsResult.errors);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const manifestRefCount = [claimsManifest?.claims || [], diagramsManifest?.diagrams || [], studyManifest?.items || []]
  .flat(Infinity)
  .reduce((count, item) => count + (Array.isArray(item?.sourceRefs) ? item.sourceRefs.length : 0), 0);
console.log(`Evidence validation passed: ${docsResult.docs.length} docs, ${docsResult.refCount} inline refs, ${sourceManifest?.sources?.length || 0} sources, ${manifestRefCount} manifest refs${pccRoot ? '' : ' (generated-only mode; corpus checkout missing)'}.`);
