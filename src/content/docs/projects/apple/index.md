---
title: "Apple Private Cloud Compute"
description: "High-level and detailed design notes for Apple PCC."
---


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
<article class="evidence-card" data-pcc-ref="apple/wiki/sources/apple-private-cloud-compute/corerequirements.md">
<h3>Core Security &amp; Privacy Requirements</h3>
<p>Dive into understanding PCC by learning about the extraordinary security requirements of the system.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">docc-json</span></p>
<p class="source-path"><code>apple/wiki/sources/apple-private-cloud-compute/corerequirements.md</code></p>
</article>
<article class="evidence-card" data-pcc-ref="apple/wiki/sources/apple-private-cloud-compute/hardwarerootoftrust.md">
<h3>Hardware Root of Trust</h3>
<p>Custom-built server hardware ensures security properties are immutable.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">docc-json</span></p>
<p class="source-path"><code>apple/wiki/sources/apple-private-cloud-compute/hardwarerootoftrust.md</code></p>
</article>
<article class="evidence-card" data-pcc-ref="apple/wiki/sources/apple-private-cloud-compute/nontargetability.md">
<h3>Non-Targetability</h3>
<p>PCC is designed to ensure that an attacker cannot target specific PCC users.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">docc-json</span></p>
<p class="source-path"><code>apple/wiki/sources/apple-private-cloud-compute/nontargetability.md</code></p>
</article>
<article class="evidence-card" data-pcc-ref="apple/wiki/sources/apple-private-cloud-compute/requestflow.md">
<h3>Request Flow</h3>
<p>Anonymous request routing is designed to ensure non-targetability.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">docc-json</span></p>
<p class="source-path"><code>apple/wiki/sources/apple-private-cloud-compute/requestflow.md</code></p>
</article>
<article class="evidence-card" data-pcc-ref="apple/wiki/sources/apple-private-cloud-compute/statelessandenforcable.md">
<h3>Stateless Computation and Enforceable Guarantees</h3>
<p>The PCC node is designed to safeguard user data and enforce it is not retained once request processing is complete.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">docc-json</span></p>
<p class="source-path"><code>apple/wiki/sources/apple-private-cloud-compute/statelessandenforcable.md</code></p>
</article>
<article class="evidence-card" data-pcc-ref="apple/wiki/sources/apple-private-cloud-compute/verifiabletransparency.md">
<h3>Verifiable Transparency</h3>
<p>Security researchers can verify the PCC privacy and security guarantees.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">docc-json</span></p>
<p class="source-path"><code>apple/wiki/sources/apple-private-cloud-compute/verifiabletransparency.md</code></p>
</article>
</div>

