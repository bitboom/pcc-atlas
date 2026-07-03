---
title: "Architecture Boundary"
description: "Where each private AI system processes sensitive data."
---


# Architecture Boundary

The architecture boundary is the physical and logical place where sensitive data is processed. It controls the threat model and determines which protections matter.

| Dimension | Apple PCC | Meta Private Processing | Google Private AI |
| --- | --- | --- | --- |
| Primary location | Cloud PCC nodes | Cloud CVM/TEE | On-device PCC for sensitive features |
| Device role | Attestation and request encryption | Anonymous/OHTTP/RA-TLS session setup | Local isolation and controlled sharing |
| Cloud trust base | Custom Apple silicon | Confidential virtualization + confidential GPUs | Google cloud + Project Oak sealed computing |
| Notable contrast | Cloud path is the protected AI path | Cloud TEE path for WhatsApp AI | On-device-first; cloud path is conditional |

<div class="evidence-grid">
<article class="evidence-card" data-pcc-ref="cross-vendor/wiki/comparisons/architecture-boundary.md">
<h3>Architecture Boundary synthesis</h3>
<p>Cross-vendor synthesis comparing where Apple, Meta, and Google place sensitive processing boundaries.</p>
<p><span class="evidence-pill">synthesis</span> <span class="evidence-pill">comparison</span></p>
<p class="source-path"><code>cross-vendor/wiki/comparisons/architecture-boundary.md</code></p>
</article>
</div>

