---
title: "Google Private AI"
description: "High-level and detailed design notes for Google Private AI, Private Compute Core, and Project Oak."
---


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
<article class="evidence-card" data-pcc-ref="google/wiki/sources/google-private-ai/android-private-ai-approach.md">
<h3>Android's private AI approach</h3>
<p>Google's articulation of the Android Private Compute Core architecture for on-device AI.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">security-blog</span></p>
<p class="source-path"><code>google/wiki/sources/google-private-ai/android-private-ai-approach.md</code></p>
</article>
<article class="evidence-card" data-pcc-ref="google/wiki/sources/google-private-ai/trust-in-transparency-private-compute.md">
<h3>Trust in transparency: Private Compute Core</h3>
<p>Transparency and verifiability principles behind Private Compute Core.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">security-blog</span></p>
<p class="source-path"><code>google/wiki/sources/google-private-ai/trust-in-transparency-private-compute.md</code></p>
</article>
<article class="evidence-card" data-pcc-ref="google/wiki/sources/google-private-ai/google_private-compute-services.md">
<h3>google/private-compute-services</h3>
<p>Official Google repo for Private Compute Services; companion to Android Private Compute Core.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">github-repo</span></p>
<p class="source-path"><code>google/wiki/sources/google-private-ai/google_private-compute-services.md</code></p>
</article>
<article class="evidence-card" data-pcc-ref="google/wiki/sources/google-private-ai/project-oak_oak.md">
<h3>project-oak/oak</h3>
<p>Project Oak: Google's framework for building trustworthy, attestation-backed applications.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">github-repo</span></p>
<p class="source-path"><code>google/wiki/sources/google-private-ai/project-oak_oak.md</code></p>
</article>
</div>

