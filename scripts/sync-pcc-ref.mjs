import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const NOT_DOCUMENTED_TEXT = 'Not documented in ingested sources';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pccCandidates = process.env.PCC_REF_DIR
  ? [process.env.PCC_REF_DIR]
  : [join(root, '..', 'pcc-ref'), join(root, 'data', 'pcc-ref')];
const pccRoot = pccCandidates.find((candidate) => existsSync(join(candidate, 'apple', 'sources.json')));
if (!pccRoot) throw new Error(`pcc-ref corpus not found. Set PCC_REF_DIR to a local checkout. Tried: ${pccCandidates.join(', ')}`);

const docsRoot = join(root, 'src', 'content', 'docs');
const dataRoot = join(root, 'src', 'data');

function readJson(path) { return JSON.parse(readFileSync(path, 'utf8')); }
function readText(path) { return readFileSync(path, 'utf8'); }
function ensureDir(path) { mkdirSync(path, { recursive: true }); }
function writeJson(name, value) { ensureDir(dataRoot); writeFileSync(join(dataRoot, name), JSON.stringify(value, null, 2) + '\n', 'utf8'); }
function escapeHtml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'); }
function frontmatter(title, description) { return `---\ntitle: "${title.replaceAll('"', '\\"')}"\ndescription: "${description.replaceAll('"', '\\"')}"\n---\n`; }
function importPrefix(slug) { return `${'../'.repeat((slug ? slug.split('/').length : 0) + 2)}components`; }
function importBlock(slug) {
  const p = importPrefix(slug);
  return `import DiagramFrame from '${p}/atlas/DiagramFrame.astro';\nimport RequestFlowDiagram from '${p}/atlas/RequestFlowDiagram.astro';\nimport TrustBoundaryDiagram from '${p}/atlas/TrustBoundaryDiagram.astro';\nimport AttestationPipelineDiagram from '${p}/atlas/AttestationPipelineDiagram.astro';\nimport ClaimCard from '${p}/atlas/ClaimCard.astro';\nimport ComparisonMatrix from '${p}/atlas/ComparisonMatrix.astro';\nimport CitationDrawer from '${p}/atlas/CitationDrawer.svelte';\nimport StudyCards from '${p}/study/StudyCards.svelte';\nimport FlowStepper from '${p}/study/FlowStepper.svelte';\nimport Quiz from '${p}/study/Quiz.svelte';\n`;
}
function writeDoc(slug, body, extension = 'mdx') {
  const out = join(docsRoot, slug, `index.${extension}`);
  ensureDir(dirname(out));
  writeFileSync(out, body.trimStart() + '\n', 'utf8');
  const oldMd = join(docsRoot, slug, 'index.md');
  if (extension === 'mdx' && existsSync(oldMd)) unlinkSync(oldMd);
}
function sourceRef(path, label) { return { path, label: label || path.split('/').pop()?.replace(/\.md$/, '') || path }; }
function titleFromMarkdown(path) {
  if (!existsSync(join(pccRoot, path))) return path.split('/').pop()?.replace(/\.md$/, '') || path;
  const text = readText(join(pccRoot, path));
  const fm = text.match(/^---[\s\S]*?title:\s*["']?([^"'\n]+)["']?[\s\S]*?---/);
  if (fm) return fm[1].trim();
  const h1 = text.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : path.split('/').pop()?.replace(/\.md$/, '') || path;
}

const commit = execFileSync('git', ['-C', pccRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const sources = {
  apple: readJson(join(pccRoot, 'apple', 'sources.json')),
  meta: readJson(join(pccRoot, 'meta', 'sources.json')),
  google: readJson(join(pccRoot, 'google', 'sources.json'))
};
const counts = Object.fromEntries(Object.entries(sources).map(([vendor, rows]) => [vendor, rows.length]));
const conceptCount = readdirSync(join(pccRoot, 'cross-vendor', 'wiki', 'concepts')).filter((f) => f.endsWith('.md')).length;
const comparisonCount = readdirSync(join(pccRoot, 'cross-vendor', 'wiki', 'comparisons')).filter((f) => f.endsWith('.md')).length;

const sourceByPath = new Map();
function addSource(path, partial = {}) {
  if (!path) return;
  if (!existsSync(join(pccRoot, path))) throw new Error(`Missing pcc-ref source path: ${path}`);
  const prev = sourceByPath.get(path) || {};
  sourceByPath.set(path, {
    path,
    title: partial.title || prev.title || titleFromMarkdown(path),
    vendor: partial.vendor || prev.vendor || path.split('/')[0],
    tier: partial.tier || prev.tier || 'synthesis',
    kind: partial.kind || prev.kind || 'markdown',
    canonicalUrl: partial.canonicalUrl || prev.canonicalUrl || null,
    sourceSha256: partial.sourceSha256 || prev.sourceSha256 || null,
    sourceId: partial.sourceId || prev.sourceId || null
  });
}
for (const [vendor, rows] of Object.entries(sources)) {
  for (const row of rows) {
    if (row.render_target) addSource(row.render_target, {
      title: row.title || row.id,
      vendor,
      tier: row.tier,
      kind: row.kind,
      canonicalUrl: row.canonical_url || null,
      sourceSha256: row.source_sha256 || null,
      sourceId: row.id
    });
  }
}
for (const dir of ['concepts', 'comparisons']) {
  for (const name of readdirSync(join(pccRoot, 'cross-vendor', 'wiki', dir)).filter((f) => f.endsWith('.md'))) {
    addSource(`cross-vendor/wiki/${dir}/${name}`, { vendor: 'cross-vendor', tier: 'synthesis', kind: dir.slice(0, -1) });
  }
}
addSource('cross-vendor/wiki/index.md', { vendor: 'cross-vendor', tier: 'synthesis', kind: 'index' });

const A = {
  core: 'apple/wiki/sources/apple-private-cloud-compute/corerequirements.md',
  stateless: 'apple/wiki/sources/apple-private-cloud-compute/statelessandenforcable.md',
  request: 'apple/wiki/sources/apple-private-cloud-compute/requestflow.md',
  nonTarget: 'apple/wiki/sources/apple-private-cloud-compute/nontargetability.md',
  transparency: 'apple/wiki/sources/apple-private-cloud-compute/verifiabletransparency.md',
  hardware: 'apple/wiki/sources/apple-private-cloud-compute/hardwarerootoftrust.md'
};
const M = {
  overview: 'meta/wiki/sources/meta-private-processing/whatsapp-private-processing-ai-tools.md',
  whitepaper: 'meta/wiki/sources/meta-private-processing/private-processing-technical-whitepaper.md',
  keyTransparency: 'meta/wiki/sources/meta-private-processing/whatsapp-key-transparency.md',
  ipls: 'meta/wiki/sources/meta-private-processing/ipls-privacy-preserving-storage-for-your-whatsapp-contacts.md'
};
const G = {
  android: 'google/wiki/sources/google-private-ai/android-private-ai-approach.md',
  pcs: 'google/wiki/sources/google-private-ai/google_private-compute-services.md',
  intro: 'google/wiki/sources/google-private-ai/introducing-androids-private-compute.md',
  transparency: 'google/wiki/sources/google-private-ai/trust-in-transparency-private-compute.md',
  oak: 'google/wiki/sources/google-private-ai/project-oak_oak.md'
};
const X = {
  boundary: 'cross-vendor/wiki/comparisons/architecture-boundary.md',
  transparency: 'cross-vendor/wiki/comparisons/transparency-and-verifiability.md',
  apple: 'cross-vendor/wiki/concepts/apple-private-cloud-compute.md',
  meta: 'cross-vendor/wiki/concepts/meta-private-processing.md',
  google: 'cross-vendor/wiki/concepts/google-private-compute-core.md',
  attestation: 'cross-vendor/wiki/concepts/remote-attestation.md',
  stateless: 'cross-vendor/wiki/concepts/stateless-inference.md',
  nonTarget: 'cross-vendor/wiki/concepts/non-targetability.md',
  verifiable: 'cross-vendor/wiki/concepts/verifiable-transparency.md'
};
for (const path of [...Object.values(A), ...Object.values(M), ...Object.values(G), ...Object.values(X)]) addSource(path);

const claims = [
  { id: 'apple-trust-boundary', project: 'apple', title: 'Apple trust boundary', summary: 'Apple PCC places the sensitive-data boundary inside custom Apple-silicon PCC compute nodes; load balancers and privacy gateways stay outside that boundary.', sourceRefs: [sourceRef(A.stateless), sourceRef(X.apple)] },
  { id: 'apple-stateless', project: 'apple', title: 'Stateless computation', summary: 'PCC is designed to use personal data only for the request and not retain it after the response; Ephemeral Data Mode and request-data lifecycle controls support this guarantee.', sourceRefs: [sourceRef(A.core), sourceRef(A.stateless), sourceRef(X.stateless)] },
  { id: 'apple-transparency', project: 'apple', title: 'Production image transparency', summary: 'Apple ties device trust to public software measurements, production images, and researcher verification tooling rather than to hidden operational trust.', sourceRefs: [sourceRef(A.transparency), sourceRef(X.transparency)] },
  { id: 'meta-trust-boundary', project: 'meta', title: 'Meta trust boundary', summary: 'Meta Private Processing places WhatsApp AI work inside a confidential virtual machine / TEE reached through anonymous routing and attested encrypted sessions.', sourceRefs: [sourceRef(M.overview), sourceRef(M.whitepaper), sourceRef(X.meta)] },
  { id: 'meta-attested-session', project: 'meta', title: 'RA-TLS session setup', summary: 'Meta describes client-server setup around remote attestation, acceptable binary logs, and encrypted communication before user data is processed.', sourceRefs: [sourceRef(M.whitepaper), sourceRef(X.attestation)] },
  { id: 'meta-transparency', project: 'meta', title: 'Artifact transparency', summary: 'Meta frames enforceable guarantees around public discoverability, artifact transparency, researcher verification, and third-party review paths.', sourceRefs: [sourceRef(M.overview), sourceRef(M.whitepaper), sourceRef(X.transparency)] },
  { id: 'google-trust-boundary', project: 'google', title: 'Google on-device boundary', summary: 'Google Private AI starts with Android Private Compute Core as an isolated on-device environment for sensitive features, with network access mediated by Private Compute Services.', sourceRefs: [sourceRef(G.android), sourceRef(G.pcs), sourceRef(X.google)] },
  { id: 'google-pcs-bridge', project: 'google', title: 'Private Compute Services bridge', summary: 'Private Compute Services is the privacy-preserving bridge for Private Compute Core features, including PIR, federated compute, HTTP downloads, and protected downloads.', sourceRefs: [sourceRef(G.pcs), sourceRef(G.intro)] },
  { id: 'google-oak', project: 'google', title: 'Project Oak sealed computing', summary: 'Project Oak provides open-source sealed-computing primitives for attested enclave applications, including staged measurement, endorsements, and Transparent Release paths.', sourceRefs: [sourceRef(G.oak), sourceRef(G.transparency), sourceRef(X.attestation)] },
  { id: 'comparison-boundary', project: 'cross-vendor', title: 'Boundary comparison', summary: 'Apple and Meta emphasize protected cloud execution boundaries, while Google emphasizes on-device isolation first and separates its Oak sealed-computing cloud path.', sourceRefs: [sourceRef(X.boundary), sourceRef(X.apple), sourceRef(X.meta), sourceRef(X.google)] },
  { id: 'comparison-transparency', project: 'cross-vendor', title: 'Transparency comparison', summary: 'The three systems expose different transparency surfaces: Apple production images and VRE, Meta artifact/CVM verification, and Google open source, reproducible builds, binary transparency, and Rekor/Oak release patterns.', sourceRefs: [sourceRef(X.transparency)] },
  { id: 'google-non-targetability-unknown', project: 'google', title: 'Google non-targetability scope', summary: NOT_DOCUMENTED_TEXT, documentationStatus: 'not_documented', sourceRefs: [sourceRef(X.nonTarget), sourceRef(G.android)] }
];

function node(id, label, summary, kind, refs, extra = {}) { return { id, label, summary, kind, sourceRefs: refs.map((r) => sourceRef(r)), ...extra }; }
function edge(id, from, to, label, refs, extra = {}) { return { id, from, to, label, summary: label, sourceRefs: refs.map((r) => sourceRef(r)), ...extra }; }
const diagrams = [
  { id: 'overview-system-map', project: 'cross-vendor', type: 'system map', title: 'Private AI compute system map', summary: 'A side-by-side map of where sensitive data is processed and where verification evidence is exposed.', nodes: [node('apple-device','Apple device','validates PCC nodes','device',[A.request]), node('apple-pcc','Apple PCC node','cloud trust boundary','private',[A.stateless]), node('meta-client','WhatsApp client','anonymous setup','device',[M.overview]), node('meta-cvm','Meta CVM / TEE','confidential AI work','private',[M.whitepaper]), node('google-pcc','Android PCC','on-device boundary','device',[G.pcs]), node('google-oak','Project Oak','sealed cloud path','cloud',[G.oak]), node('public-evidence','Public evidence','logs / VRE / source','log',[X.transparency])], edges: [edge('apple-to-pcc','apple-device','apple-pcc','attested encrypted request',[A.request,A.transparency]), edge('meta-to-cvm','meta-client','meta-cvm','OHTTP + RA-TLS',[M.whitepaper]), edge('google-to-pcs','google-pcc','google-oak','conditional cloud path',[G.android,G.oak]), edge('systems-to-evidence','apple-pcc','public-evidence','verifiability surface',[X.transparency])] },
  { id: 'apple-request-flow', project: 'apple', type: 'request flow', title: 'Apple PCC request flow', summary: 'Device-side validation and encryption keep supporting data-center services outside the sensitive-data boundary.', nodes: [node('device','User device','selects validated nodes','device',[A.request]), node('gateway','Privacy gateway','outside trust boundary','external',[A.stateless]), node('pcc-node','PCC compute node','decrypts and processes','private',[A.stateless]), node('transparency','Transparency log','measurement evidence','log',[A.transparency])], edges: [edge('device-verify','device','transparency','checks software measurements',[A.transparency]), edge('device-gateway','device','gateway','routes without decryption',[A.request,A.nonTarget]), edge('gateway-node','gateway','pcc-node','encrypted request reaches node',[A.request]), edge('node-log','pcc-node','transparency','software image is public evidence',[A.transparency])] },
  { id: 'apple-attestation', project: 'apple', type: 'attestation chain', title: 'Apple attestation and transparency chain', summary: 'Hardware roots and public measurements turn the cloud node into a verifiable target before data is sent.', nodes: [node('hardware','Hardware root','Apple silicon roots','private',[A.hardware]), node('measured-code','Measured code','authorized software only','private',[A.stateless]), node('device-check','Device check','validates target','device',[A.request]), node('vre','Research tooling','VRE and images','log',[A.transparency])], edges: [edge('hardware-code','hardware','measured-code','measured boot',[A.hardware,A.stateless]), edge('code-device','measured-code','device-check','attestation evidence',[A.request]), edge('code-vre','measured-code','vre','public inspection',[A.transparency])] },
  { id: 'meta-request-flow', project: 'meta', type: 'request flow', title: 'Meta Private Processing request flow', summary: 'WhatsApp uses anonymous routing and attested CVMs so the request can be processed without exposing message content to relay or gateway layers.', nodes: [node('client','WhatsApp client','user-initiated AI request','device',[M.overview]), node('acs','Anonymous credentials','optional/private access','external',[M.whitepaper]), node('relay','OHTTP relay','third-party routing','external',[M.whitepaper]), node('gateway','Meta gateway','cannot read content','external',[M.whitepaper]), node('cvm','CVM / TEE','private processing app','private',[M.whitepaper])], edges: [edge('client-acs','client','acs','anonymous credential setup',[M.whitepaper]), edge('client-relay','client','relay','OHTTP encrypted request',[M.whitepaper]), edge('relay-gateway','relay','gateway','unlinkable routing hop',[M.whitepaper]), edge('gateway-cvm','gateway','cvm','attested encrypted session',[M.whitepaper])] },
  { id: 'meta-attestation', project: 'meta', type: 'attestation chain', title: 'Meta CVM attestation chain', summary: 'The client checks CVM measurements and acceptable binary logs before sending protected content.', nodes: [node('cvm-image','CVM image','measured artifact','private',[M.whitepaper]), node('third-party-log','Third-party log','acceptable binaries','log',[M.whitepaper]), node('ra-tls','RA-TLS','attested channel','private',[M.whitepaper]), node('researchers','Researchers','continuous verification','external',[M.overview])], edges: [edge('image-log','cvm-image','third-party-log','digest publication',[M.whitepaper]), edge('log-ratls','third-party-log','ra-tls','policy verification',[M.whitepaper]), edge('ratls-research','ra-tls','researchers','verification surface',[M.overview,M.whitepaper])] },
  { id: 'google-system-map', project: 'google', type: 'system map', title: 'Google Private AI system map', summary: 'Google separates Android on-device isolation from Project Oak sealed-computing cloud patterns.', nodes: [node('apps','Android apps','outside PCC','external',[G.pcs]), node('pcc','Private Compute Core','isolated on-device work','device',[G.pcs]), node('pcs','Private Compute Services','privacy-preserving bridge','private',[G.pcs]), node('pir','PIR / federated compute','limited APIs','cloud',[G.pcs]), node('oak','Project Oak','sealed cloud apps','cloud',[G.oak])], edges: [edge('apps-pcc','apps','pcc','OS isolation boundary',[G.pcs]), edge('pcc-pcs','pcc','pcs','no direct network access',[G.pcs]), edge('pcs-pir','pcs','pir','PIR / protected download',[G.pcs]), edge('pcc-oak','pcc','oak','separate cloud path',[G.android,G.oak])] },
  { id: 'google-oak-transparency', project: 'google', type: 'transparency pipeline', title: 'Google Oak transparency pipeline', summary: 'Oak emphasizes open-source sealed computing, attestable enclave applications, and transparent releases.', nodes: [node('source','Source code','open components','external',[G.oak]), node('build','Reproducible build','provenance','private',[G.oak]), node('rekor','Rekor / transparency','release evidence','log',[G.oak,G.transparency]), node('client','Verifier','checks attestation','device',[G.oak])], edges: [edge('source-build','source','build','build provenance',[G.oak]), edge('build-rekor','build','rekor','transparent release',[G.oak]), edge('rekor-client','rekor','client','verification evidence',[G.oak])] },
  { id: 'comparison-request-flow', project: 'cross-vendor', type: 'comparison', title: 'Request-flow contrast', summary: 'The projects differ most in where the first protected boundary appears and what public evidence a client or researcher can inspect.', nodes: [node('apple','Apple','device-to-PCC cloud','private',[A.request,X.apple]), node('meta','Meta','client-to-CVM cloud','private',[M.whitepaper,X.meta]), node('google','Google','on-device PCC first','device',[G.pcs,X.google]), node('unknown','Google non-targetability',NOT_DOCUMENTED_TEXT,'external',[X.nonTarget,G.android],{ documentationStatus: 'not_documented' })], edges: [edge('apple-meta','apple','meta','cloud confidential path',[X.boundary]), edge('meta-google','meta','google','cloud vs on-device first',[X.boundary]), edge('google-unknown','google','unknown',NOT_DOCUMENTED_TEXT,[X.nonTarget,G.android],{ documentationStatus: 'not_documented' })] }
];

const studyItems = [
  { id: 'apple-flow-1', project: 'apple', type: 'flow-step', title: 'Validate before sending', summary: 'The device validates the PCC target and software evidence before protected user data is sent.', sourceRefs: [sourceRef(A.request), sourceRef(A.transparency)] },
  { id: 'meta-flow-1', project: 'meta', type: 'flow-step', title: 'Build an anonymous attested path', summary: 'The WhatsApp client uses anonymous routing and attestation before the CVM processes content.', sourceRefs: [sourceRef(M.whitepaper)] },
  { id: 'google-flow-1', project: 'google', type: 'flow-step', title: 'Stay on device first', summary: 'Android Private Compute Core isolates sensitive features and uses Private Compute Services as the network bridge.', sourceRefs: [sourceRef(G.pcs)] },
  { id: 'apple-card', project: 'apple', type: 'flashcard', question: 'What is the Apple PCC trust boundary?', answer: 'The custom Apple-silicon PCC compute node, not load balancers or privacy gateways.', sourceRefs: [sourceRef(A.stateless), sourceRef(X.apple)] },
  { id: 'meta-card', project: 'meta', type: 'flashcard', question: 'What does Meta verify before private processing?', answer: 'A CVM/TEE measurement and acceptable binary policy before encrypted user data is processed.', sourceRefs: [sourceRef(M.whitepaper)] },
  { id: 'google-card', project: 'google', type: 'flashcard', question: 'What makes Google structurally different?', answer: 'The sensitive-data boundary is on-device first through Android Private Compute Core, with a separate Oak cloud path.', sourceRefs: [sourceRef(G.pcs), sourceRef(G.oak), sourceRef(X.google)] },
  { id: 'boundary-quiz', project: 'cross-vendor', type: 'quiz', question: 'Which project primarily frames the sensitive-data boundary as Android on-device isolation?', options: ['Apple PCC', 'Meta Private Processing', 'Google Private AI'], answer: 'Google Private AI', sourceRefs: [sourceRef(G.pcs), sourceRef(X.google)] },
  { id: 'transparency-quiz', project: 'cross-vendor', type: 'quiz', question: 'Which transparency phrase belongs to Apple PCC in this corpus?', options: ['Virtual Research Environment', 'Anonymous Credentials Service', 'Private Compute Services'], answer: 'Virtual Research Environment', sourceRefs: [sourceRef(A.transparency), sourceRef(X.transparency)] }
];

const sourceManifest = { pccRefCommit: commit, generatedAt: new Date().toISOString(), sources: [...sourceByPath.values()].sort((a, b) => a.path.localeCompare(b.path)) };
writeJson('pcc-ref-build.json', { pccRefRemote: 'https://github.com/bitboom/pcc-ref.git', pccRefCommit: commit, generatedAt: new Date().toISOString(), counts, totalSources: counts.apple + counts.meta + counts.google, conceptCount, comparisonCount });
writeJson('sources.generated.json', sources);
writeJson('source-manifest.generated.json', sourceManifest);
writeJson('claims.generated.json', { pccRefCommit: commit, generatedAt: new Date().toISOString(), claims });
writeJson('diagrams.generated.json', { pccRefCommit: commit, generatedAt: new Date().toISOString(), diagrams });
writeJson('study.generated.json', { pccRefCommit: commit, generatedAt: new Date().toISOString(), items: studyItems });

function pageImports(slug) { return `\n${importBlock(slug)}\n`; }
function claimList(ids) { return ids.map((id) => `<ClaimCard claimId="${id}" />`).join('\n'); }

writeDoc('', `${frontmatter('PCC Atlas', 'Diagram-first, source-backed atlas of private AI compute systems.')}
${pageImports('')}

<div class="hero-atlas">
<p class="kicker">Diagram-first evidence atlas</p>
<h1>PCC Atlas</h1>
<p>PCC Atlas explains private AI compute systems through site-native SVG maps, guided study interactions, and source-backed summaries. Raw corpus paths remain available as evidence, but the primary learning surface is the atlas itself.</p>
<div class="stat-row">
  <span class="stat-pill"><strong>${counts.apple}</strong> Apple sources</span>
  <span class="stat-pill"><strong>${counts.meta}</strong> Meta sources</span>
  <span class="stat-pill"><strong>${counts.google}</strong> Google sources</span>
  <span class="stat-pill"><strong>${counts.apple + counts.meta + counts.google}</strong> total primary sources</span>
</div>
<p class="small-muted">Built from pcc-ref commit <code>${commit.slice(0, 12)}</code>.</p>
</div>

<DiagramFrame diagramId="overview-system-map" />

## Start with the three systems

<div class="project-grid">
  <article class="project-card apple"><h3><a href="/pcc-atlas/projects/apple/">Apple Private Cloud Compute</a></h3><p>Cloud PCC nodes with device-side validation, statelessness, non-targetability, and public software transparency.</p></article>
  <article class="project-card meta"><h3><a href="/pcc-atlas/projects/meta/">Meta / WhatsApp Private Processing</a></h3><p>Optional WhatsApp AI work inside CVM/TEE infrastructure reached through anonymous routing and RA-TLS.</p></article>
  <article class="project-card google"><h3><a href="/pcc-atlas/projects/google/">Google Private AI</a></h3><p>Android Private Compute Core is on-device-first; Project Oak describes a separate sealed-computing cloud path.</p></article>
</div>

<ComparisonMatrix claimIds={["comparison-boundary", "comparison-transparency", "google-non-targetability-unknown"]} />

<StudyCards project="all" client:only="svelte" />
<Quiz project="cross-vendor" client:only="svelte" />

## Evidence contract

Every substantive claim, diagram node, diagram edge, flow step, and quiz answer is backed by <code>sourceRefs</code> in the generated manifests. Unknown dimensions render exactly: **${NOT_DOCUMENTED_TEXT}**.
`);

function projectPage(slug, title, intro, diagramIds, claimIds, project, primarySource) {
  writeDoc(`projects/${slug}`, `${frontmatter(title, `${title} diagram-first overview.`)}
${pageImports(`projects/${slug}`)}

# ${title}

${intro}

${diagramIds.map((id) => id.includes('attestation') || id.includes('transparency') ? `<AttestationPipelineDiagram diagramId="${id}" />` : id.includes('request') ? `<RequestFlowDiagram diagramId="${id}" />` : `<TrustBoundaryDiagram diagramId="${id}" />`).join('\n\n')}

## Source-backed design claims

${claimList(claimIds)}

<CitationDrawer sourcePath="${primarySource}" label="Inspect primary source" client:only="svelte" />
<FlowStepper project="${project}" client:only="svelte" />
<StudyCards project="${project}" client:only="svelte" />
`);
}
projectPage('apple', 'Apple Private Cloud Compute', 'Apple PCC is the cloud compute path for Apple Intelligence requests that require server-side model execution. The atlas view focuses on device validation, PCC node trust boundaries, stateless processing, and public transparency evidence.', ['apple-request-flow', 'apple-attestation'], ['apple-trust-boundary', 'apple-stateless', 'apple-transparency'], 'apple', A.stateless);
projectPage('meta', 'Meta / WhatsApp Private Processing', 'Meta Private Processing is an optional WhatsApp AI path designed to process user-directed requests inside confidential infrastructure that Meta and WhatsApp should not be able to inspect.', ['meta-request-flow', 'meta-attestation'], ['meta-trust-boundary', 'meta-attested-session', 'meta-transparency'], 'meta', M.whitepaper);
projectPage('google', 'Google Private AI / Private Compute Core / Project Oak', 'Google Private AI is on-device-first for sensitive Android features through Private Compute Core and Private Compute Services. Project Oak is a separate sealed-computing cloud path for attestable enclave applications.', ['google-system-map', 'google-oak-transparency'], ['google-trust-boundary', 'google-pcs-bridge', 'google-oak', 'google-non-targetability-unknown'], 'google', G.pcs);

writeDoc('compare/architecture-boundary', `${frontmatter('Architecture Boundary', 'Where each private AI system processes sensitive data.')}
${pageImports('compare/architecture-boundary')}

# Architecture Boundary

The architecture boundary is the place where sensitive data becomes readable for computation. Apple and Meta emphasize protected cloud execution boundaries; Google emphasizes an on-device boundary first and separates its Oak sealed-computing path.

<DiagramFrame diagramId="comparison-request-flow" />
<ComparisonMatrix claimIds={["apple-trust-boundary", "meta-trust-boundary", "google-trust-boundary", "comparison-boundary", "google-non-targetability-unknown"]} />
<Quiz project="cross-vendor" client:only="svelte" />
`);

writeDoc('compare/request-flow', `${frontmatter('Request Flow', 'Compare request/session flow across Apple, Meta, and Google.')}
${pageImports('compare/request-flow')}

# Request Flow

This page compares the first protected boundary each system asks the user/client to trust.

<RequestFlowDiagram diagramId="apple-request-flow" />
<RequestFlowDiagram diagramId="meta-request-flow" />
<TrustBoundaryDiagram diagramId="google-system-map" />
<FlowStepper project="all" client:only="svelte" />
`);

writeDoc('compare/transparency-and-verifiability', `${frontmatter('Transparency and Verifiability', 'How each project lets outsiders inspect or verify claims.')}
${pageImports('compare/transparency-and-verifiability')}

# Transparency and Verifiability

Transparency differs by project: Apple emphasizes production image transparency and VRE, Meta emphasizes CVM/artifact verification, and Google/Oak emphasizes open source, reproducible builds, binary transparency, and Rekor-style release evidence.

<AttestationPipelineDiagram diagramId="apple-attestation" />
<AttestationPipelineDiagram diagramId="meta-attestation" />
<AttestationPipelineDiagram diagramId="google-oak-transparency" />
<ComparisonMatrix claimIds={["apple-transparency", "meta-transparency", "google-oak", "comparison-transparency"]} />
`);

writeDoc('study', `${frontmatter('Interactive Study', 'Flashcards, flow steps, and quizzes for PCC Atlas.')}
${pageImports('study')}

# Interactive Study

Use the study widgets to rehearse the architecture boundary, request flow, attestation, and transparency differences. Each answer exposes a source path, so the exercise remains evidence-backed instead of becoming memorization without provenance.

<FlowStepper project="all" client:only="svelte" />
<StudyCards project="all" client:only="svelte" />
<Quiz project="cross-vendor" client:only="svelte" />
`);

const concepts = [
  ['concepts/stateless-inference', 'Stateless Inference', 'How systems limit retention of personal data after processing.', X.stateless],
  ['concepts/non-targetability', 'Non-Targetability', 'How systems make targeted compromise harder than broad compromise.', X.nonTarget],
  ['concepts/remote-attestation', 'Remote Attestation', 'How clients verify what code and hardware they are talking to.', X.attestation],
  ['concepts/verifiable-transparency', 'Verifiable Transparency', 'How public logs, reproducible builds, or researcher tooling make claims checkable.', X.verifiable]
];
for (const [slug, title, description, sourcePath] of concepts) {
  writeDoc(slug, `${frontmatter(title, description)}
${pageImports(slug)}

# ${title}

${description}

<ClaimCard claimId="${title === 'Stateless Inference' ? 'apple-stateless' : title === 'Non-Targetability' ? 'google-non-targetability-unknown' : title === 'Remote Attestation' ? 'meta-attested-session' : 'comparison-transparency'}" />
<CitationDrawer sourcePath="${sourcePath}" client:only="svelte" />
`);
}

const rows = sourceManifest.sources.map((entry) => `| ${entry.vendor} | ${entry.tier} | ${entry.kind} | ${entry.title.replaceAll('|', '\\|')} | <code>${entry.path}</code> | ${entry.canonicalUrl ? `[canonical](${entry.canonicalUrl})` : ''} |`).join('\n');
writeDoc('evidence', `${frontmatter('Evidence Explorer', 'Registry-backed evidence index for PCC Atlas.')}
${pageImports('evidence')}

# Evidence Explorer

PCC Atlas is built from pinned <code>pcc-ref</code> commit <code>${commit}</code>. This page is generated from the normalized source manifest, not from ad-hoc links.

<div class="stat-row">
  <span class="stat-pill"><strong>${counts.apple}</strong> Apple</span>
  <span class="stat-pill"><strong>${counts.meta}</strong> Meta</span>
  <span class="stat-pill"><strong>${counts.google}</strong> Google</span>
  <span class="stat-pill"><strong>${sourceManifest.sources.length}</strong> manifest sources</span>
</div>

<ComparisonMatrix claimIds={["comparison-boundary", "comparison-transparency"]} />

| Vendor | Tier | Kind | Title | Source path | Canonical |
| --- | --- | --- | --- | --- | --- |
${rows}
`);

console.log(`Synced PCC Atlas docs from pcc-ref ${commit.slice(0, 12)} (${counts.apple + counts.meta + counts.google} primary sources, ${sourceManifest.sources.length} manifest sources).`);
