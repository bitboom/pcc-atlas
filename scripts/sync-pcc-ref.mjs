import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pccCandidates = [
  process.env.PCC_REF_DIR,
  join(root, '..', 'pcc-ref'),
  join(root, 'data', 'pcc-ref')
].filter(Boolean);
const pccRoot = pccCandidates.find((candidate) => existsSync(join(candidate, 'apple', 'sources.json')));
if (!pccRoot) {
  throw new Error(`pcc-ref corpus not found. Set PCC_REF_DIR to a local checkout. Tried: ${pccCandidates.join(', ')}`);
}
const docsRoot = join(root, 'src', 'content', 'docs');
const dataRoot = join(root, 'src', 'data');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function writeDoc(slug, body) {
  const out = join(docsRoot, slug, 'index.md');
  ensureDir(dirname(out));
  writeFileSync(out, body.trimStart() + '\n', 'utf8');
}

function relLink(path, label = path) {
  return `<code>${escapeHtml(label === path ? path : label)}</code>`;
}

function sourceAttr(path) {
  return path ? ` data-pcc-ref="${path}"` : '';
}

function sourceCard(entry) {
  const target = entry.render_target || '';
  const kind = entry.kind || 'source';
  const tier = entry.tier || 'unknown';
  const title = entry.title || entry.id;
  const summary = entry.summary || 'No summary in registry.';
  const rendered = target ? `<p class="source-path">${relLink(target)}</p>` : '';
  return `<article class="evidence-card"${sourceAttr(target)}>
<h3>${escapeHtml(title)}</h3>
<p>${escapeHtml(summary)}</p>
<p><span class="evidence-pill">${escapeHtml(tier)}</span> <span class="evidence-pill">${escapeHtml(kind)}</span></p>
${rendered}
</article>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function pick(vendor, fragments) {
  return sources[vendor].filter((entry) => {
    const haystack = `${entry.id} ${entry.title} ${entry.render_target || ''}`.toLowerCase();
    return fragments.some((fragment) => haystack.includes(fragment.toLowerCase()));
  });
}

function frontmatter(title, description) {
  return `---\ntitle: "${title.replaceAll('"', '\\"')}"\ndescription: "${description.replaceAll('"', '\\"')}"\n---\n`;
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

ensureDir(dataRoot);
writeFileSync(join(dataRoot, 'pcc-ref-build.json'), JSON.stringify({
  pccRefRemote: 'https://github.com/bitboom/pcc-ref.git',
  pccRefCommit: commit,
  generatedAt: new Date().toISOString(),
  counts,
  totalSources: counts.apple + counts.meta + counts.google,
  conceptCount,
  comparisonCount
}, null, 2) + '\n');
writeFileSync(join(dataRoot, 'sources.generated.json'), JSON.stringify(sources, null, 2) + '\n');

const appleEvidence = pick('apple', ['corerequirements', 'statelessandenforcable', 'nontargetability', 'verifiabletransparency', 'hardwarerootoftrust', 'requestflow']);
const metaEvidence = pick('meta', ['whatsapp-private-processing-ai-tools', 'private-processing-whitepaper', 'key-transparency', 'ipls']);
const googleEvidence = pick('google', ['android-private-ai-approach', 'private-compute-services', 'project-oak', 'trust-in-transparency']);

writeDoc('', `${frontmatter('PCC Atlas', 'A source-backed atlas of private AI compute systems.')}

<div class="hero-atlas">
<p class="kicker">Pinned evidence atlas</p>
<h1>PCC Atlas</h1>
<p>PCC Atlas explains private AI compute systems from high-level system design down to detailed security mechanisms, using the pinned <code>bitboom/pcc-ref</code> evidence corpus as source of truth.</p>
<div class="stat-row">
  <span class="stat-pill"><strong>${counts.apple}</strong> Apple sources</span>
  <span class="stat-pill"><strong>${counts.meta}</strong> Meta sources</span>
  <span class="stat-pill"><strong>${counts.google}</strong> Google sources</span>
  <span class="stat-pill"><strong>${counts.apple + counts.meta + counts.google}</strong> total primary sources</span>
</div>
<p class="small-muted">Built from pcc-ref commit <code>${commit.slice(0, 12)}</code>.</p>
</div>

## Read by project

<div class="project-grid">
  <article class="project-card apple">
    <h3><a href="/pcc-atlas/projects/apple/">Apple Private Cloud Compute</a></h3>
    <p>Cloud compute nodes based on custom Apple silicon, with device-side attestation, stateless processing, non-targetability, and public production-image transparency.</p>
  </article>
  <article class="project-card meta">
    <h3><a href="/pcc-atlas/projects/meta/">Meta / WhatsApp Private Processing</a></h3>
    <p>Optional WhatsApp AI processing inside confidential virtual machines, using OHTTP, anonymous credentials, RA-TLS, and third-party binary transparency.</p>
  </article>
  <article class="project-card google">
    <h3><a href="/pcc-atlas/projects/google/">Google Private AI</a></h3>
    <p>On-device-first Android Private Compute Core plus Private Compute Services and Project Oak sealed-computing infrastructure for attestable cloud paths.</p>
  </article>
</div>

## Trust-boundary map

<div class="trust-boundary">
  <div class="boundary-node"><b>Apple</b>PCC compute node: custom Apple-silicon server running publicly logged software.</div>
  <div class="boundary-node"><b>Meta</b>CVM/TEE: confidential processing environment reached through anonymous/OHTTP session setup.</div>
  <div class="boundary-node"><b>Google</b>Private Compute Core on device, plus Project Oak enclave apps for sealed computing.</div>
</div>

## How to read this site

1. Start with the three project overviews.
2. Compare the architecture boundary and transparency model.
3. Use concept pages for recurring mechanisms such as stateless inference, non-targetability, remote attestation, and verifiable transparency.
4. Use the evidence explorer to inspect registry entries, source tiers, canonical URLs, and pinned source paths.

## Evidence contract

Every substantive claim on this site is backed by a source path in the pinned corpus. If a dimension is missing from the ingested sources, the site says “not documented in ingested sources” rather than treating that as absence of the property.
`);

writeDoc('projects/apple', `${frontmatter('Apple Private Cloud Compute', 'High-level and detailed design notes for Apple PCC.')}

# Apple Private Cloud Compute

Apple PCC is the cloud compute path for Apple Intelligence requests that need server-side model execution. The user device encrypts requests to validated PCC nodes, while load balancers and privacy gateways remain outside the trust boundary.

<div class="trust-boundary">
  <div class="boundary-node"><b>Trust boundary</b>Custom Apple-silicon PCC compute node.</div>
  <div class="boundary-node"><b>Device role</b>Validates attestation and encrypts request keys to selected nodes.</div>
  <div class="boundary-node"><b>Verification</b>Production software measurements are tied to a public transparency log and VRE tooling.</div>
</div>

## High-level design

- Stateless computation on personal user data.
- Enforceable guarantees rooted in measured boot, Secure Enclave behavior, and software restrictions.
- No privileged runtime access such as remote shell or general-purpose debug paths.
- Non-targetability via anonymous routing, blind signatures, and statistical node selection.
- Verifiable transparency through public software images, logs, and research tooling.

## Detailed design ladder

1. Hardware root of trust and manufacturing identity.
2. Secure and measured boot.
3. Ephemeral Data Mode and data-volume erasure.
4. Request flow from device to validated node subset.
5. Distributed inference and ensemble attestation.
6. Public transparency log and Virtual Research Environment.

## Evidence cards

<div class="evidence-grid">
${appleEvidence.map(sourceCard).join('\n')}
</div>
`);

writeDoc('projects/meta', `${frontmatter('Meta / WhatsApp Private Processing', 'High-level and detailed design notes for Meta Private Processing.')}

# Meta / WhatsApp Private Processing

Meta Private Processing is an optional WhatsApp capability for AI features such as summarization or writing suggestions, designed so message content is processed inside confidential infrastructure that Meta and WhatsApp cannot inspect.

<div class="trust-boundary">
  <div class="boundary-node"><b>Trust boundary</b>Confidential Virtual Machine / TEE running Private Processing.</div>
  <div class="boundary-node"><b>Device role</b>Builds an anonymous OHTTP path, verifies attestation through RA-TLS, then sends encrypted requests.</div>
  <div class="boundary-node"><b>Verification</b>Planned/open researcher access, CVM image publication, source components, bounty coverage, and third-party logs.</div>
</div>

## High-level design

- Confidential processing in a cloud TEE.
- Enforceable guarantees that fail closed or become publicly discoverable.
- Verifiable transparency for users and independent security researchers.
- Non-targetability through third-party OHTTP relay and anonymous credentials.
- Stateless processing and forward security after each session.

## Detailed design ladder

1. Anonymous client authentication.
2. Third-party relay and OHTTP setup.
3. HPKE public-key discovery.
4. RA-TLS session establishment with the TEE.
5. End-to-end encrypted request and response.
6. CVM image/source transparency and researcher verification.

## Evidence cards

<div class="evidence-grid">
${metaEvidence.map(sourceCard).join('\n')}
</div>
`);

writeDoc('projects/google', `${frontmatter('Google Private AI', 'High-level and detailed design notes for Google Private AI, Private Compute Core, and Project Oak.')}

# Google Private AI / Private Compute Core / Project Oak

Google Private AI is on-device-first for sensitive Android features, centered on Android Private Compute Core. For cloud paths, Google points to secure cloud infrastructure and Project Oak sealed computing for remotely attestable enclave applications.

<div class="trust-boundary">
  <div class="boundary-node"><b>Trust boundary</b>On-device Android Private Compute Core for sensitive features.</div>
  <div class="boundary-node"><b>Network bridge</b>Private Compute Services exposes limited privacy-preserving APIs.</div>
  <div class="boundary-node"><b>Cloud path</b>Project Oak enclave applications with attestation, DICE measurement, and Transparent Release.</div>
</div>

## High-level design

- On-device processing for sensitive tasks, including offline-capable Gemini Nano cases.
- Private Compute Core isolated from apps and direct network access.
- Private Compute Services bridges to the network for PIR, federated compute, static downloads, and protected downloads.
- Project Oak provides open-source sealed-computing primitives for attested cloud enclave applications.
- Transparency uses open source, reproducible builds, Android binary transparency, and Rekor/Sigstore for Oak releases.

## Detailed design ladder

1. Android Private Compute Core isolation.
2. Private Compute Services as the only network bridge.
3. Federated learning/analytics and PIR.
4. Project Oak enclave/host split.
5. TEE hardware root of trust, DICE-style staged measurement, and endorsements.
6. Transparent Release, Rekor logging, provenance, and reproducible builds.

## Evidence cards

<div class="evidence-grid">
${googleEvidence.map(sourceCard).join('\n')}
</div>
`);

writeDoc('compare/architecture-boundary', `${frontmatter('Architecture Boundary', 'Where each private AI system processes sensitive data.')}

# Architecture Boundary

The architecture boundary is the physical and logical place where sensitive data is processed. It controls the threat model and determines which protections matter.

| Dimension | Apple PCC | Meta Private Processing | Google Private AI |
| --- | --- | --- | --- |
| Primary location | Cloud PCC nodes | Cloud CVM/TEE | On-device PCC for sensitive features |
| Device role | Attestation and request encryption | Anonymous/OHTTP/RA-TLS session setup | Local isolation and controlled sharing |
| Cloud trust base | Custom Apple silicon | Confidential virtualization + confidential GPUs | Google cloud + Project Oak sealed computing |
| Notable contrast | Cloud path is the protected AI path | Cloud TEE path for WhatsApp AI | On-device-first; cloud path is conditional |

<div class="evidence-grid">
${sourceCard({ title: 'Architecture Boundary synthesis', summary: 'Cross-vendor synthesis comparing where Apple, Meta, and Google place sensitive processing boundaries.', tier: 'synthesis', kind: 'comparison', render_target: 'cross-vendor/wiki/comparisons/architecture-boundary.md' })}
</div>
`);

writeDoc('compare/transparency-and-verifiability', `${frontmatter('Transparency and Verifiability', 'How each project lets outsiders inspect or verify claims.')}

# Transparency and Verifiability

All three systems bind trust to externally inspectable or logged software, but they expose different researcher workflows.

| Dimension | Apple PCC | Meta Private Processing | Google Private AI / Oak |
| --- | --- | --- | --- |
| Researcher model | VRE plus public production images | Bug bounty, CVM images, selected source components | Open source, reproducible builds, Transparent Release |
| Log model | Append-only PCC software measurement log | Third-party CVM digest/image log | Android binary transparency and Rekor for Oak |
| Openness posture | Binary/image inspection with dedicated tooling | Component publication and whitepaper/audit path | Source-first for PCS and Oak |

<div class="evidence-grid">
${sourceCard({ title: 'Transparency and Verifiability synthesis', summary: 'Cross-vendor synthesis comparing researcher access and transparency models.', tier: 'synthesis', kind: 'comparison', render_target: 'cross-vendor/wiki/comparisons/transparency-and-verifiability.md' })}
</div>
`);

const concepts = [
  ['concepts/stateless-inference', 'Stateless Inference', 'How systems limit retention of personal data after processing.', 'cross-vendor/wiki/concepts/stateless-inference.md'],
  ['concepts/non-targetability', 'Non-Targetability', 'How systems make targeted compromise harder than broad compromise.', 'cross-vendor/wiki/concepts/non-targetability.md'],
  ['concepts/remote-attestation', 'Remote Attestation', 'How clients verify what code and hardware they are talking to.', 'cross-vendor/wiki/concepts/remote-attestation.md'],
  ['concepts/verifiable-transparency', 'Verifiable Transparency', 'How public logs, reproducible builds, or researcher tooling make claims checkable.', 'cross-vendor/wiki/concepts/verifiable-transparency.md']
];
for (const [slug, title, description, sourcePath] of concepts) {
  writeDoc(slug, `${frontmatter(title, description)}

# ${title}

${description}

This concept page is sourced from the pinned cross-vendor synthesis corpus. The public site keeps the concept concise and links to the source page for full citation detail.

<div class="evidence-grid">
${sourceCard({ title, summary: description, tier: 'synthesis', kind: 'concept', render_target: sourcePath })}
</div>
`);
}

const allSources = Object.entries(sources).flatMap(([vendor, entries]) => entries.map((entry) => ({ vendor, ...entry })));
const evidenceRows = allSources.map((entry) => {
  const rendered = entry.render_target ? relLink(entry.render_target) : 'not rendered';
  const canon = entry.canonical_url ? `[canonical](${entry.canonical_url})` : '';
  return `| ${entry.vendor} | ${entry.tier} | ${entry.kind} | ${entry.title.replaceAll('|', '\\|')} | ${rendered} | ${canon} |`;
}).join('\n');

writeDoc('evidence', `${frontmatter('Evidence Explorer', 'Registry-backed evidence index for PCC Atlas.')}

# Evidence Explorer

PCC Atlas is built from pinned <code>pcc-ref</code> commit <code>${commit}</code>. This page is generated from <code>apple/sources.json</code>, <code>meta/sources.json</code>, and <code>google/sources.json</code>.

<div class="stat-row">
  <span class="stat-pill"><strong>${counts.apple}</strong> Apple</span>
  <span class="stat-pill"><strong>${counts.meta}</strong> Meta</span>
  <span class="stat-pill"><strong>${counts.google}</strong> Google</span>
  <span class="stat-pill"><strong>${allSources.length}</strong> Total</span>
</div>

| Vendor | Tier | Kind | Title | Local source | Canonical |
| --- | --- | --- | --- | --- | --- |
${evidenceRows}
`);

console.log(`Synced PCC Atlas docs from pcc-ref ${commit.slice(0, 12)} (${allSources.length} sources).`);
