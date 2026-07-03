---
title: "PCC Atlas"
description: "A source-backed atlas of private AI compute systems."
---


<div class="hero-atlas">
<p class="kicker">Pinned evidence atlas</p>
<h1>PCC Atlas</h1>
<p>PCC Atlas explains private AI compute systems from high-level system design down to detailed security mechanisms, using the pinned <code>bitboom/pcc-ref</code> evidence corpus as source of truth.</p>
<div class="stat-row">
  <span class="stat-pill"><strong>42</strong> Apple sources</span>
  <span class="stat-pill"><strong>7</strong> Meta sources</span>
  <span class="stat-pill"><strong>5</strong> Google sources</span>
  <span class="stat-pill"><strong>54</strong> total primary sources</span>
</div>
<p class="small-muted">Built from pcc-ref commit <code>4baf99739462</code>.</p>
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

