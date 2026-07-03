---
title: "Meta / WhatsApp Private Processing"
description: "High-level and detailed design notes for Meta Private Processing."
---


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
<article class="evidence-card" data-pcc-ref="meta/wiki/sources/meta-private-processing/whatsapp-private-processing-ai-tools.md">
<h3>Building Private Processing for AI tools on WhatsApp</h3>
<p>The foundational Private Processing announcement: secure enclave-based, open-source-backed AI processing for WhatsApp.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">engineering-blog</span></p>
<p class="source-path">[meta/wiki/sources/meta-private-processing/whatsapp-private-processing-ai-tools.md](https://github.com/bitboom/pcc-ref/blob/4baf997394629ad6e39790e38ede3a7768fa2f35/meta/wiki/sources/meta-private-processing/whatsapp-private-processing-ai-tools.md)</p>
</article>
<article class="evidence-card" data-pcc-ref="meta/wiki/sources/meta-private-processing/whatsapp-key-transparency.md">
<h3>Deploying key transparency at WhatsApp</h3>
<p>Key transparency deployment at WhatsApp; auditable key directory relevant to Private Processing trust model.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">engineering-blog</span></p>
<p class="source-path">[meta/wiki/sources/meta-private-processing/whatsapp-key-transparency.md](https://github.com/bitboom/pcc-ref/blob/4baf997394629ad6e39790e38ede3a7768fa2f35/meta/wiki/sources/meta-private-processing/whatsapp-key-transparency.md)</p>
</article>
<article class="evidence-card" data-pcc-ref="meta/wiki/sources/meta-private-processing/ipls-privacy-preserving-storage-for-your-whatsapp-contacts.md">
<h3>IPLS: Privacy-preserving storage for your WhatsApp contacts</h3>
<p>Identity Provider Linked Storage; privacy-preserving contact storage precedent for Private Processing.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">engineering-blog</span></p>
<p class="source-path">[meta/wiki/sources/meta-private-processing/ipls-privacy-preserving-storage-for-your-whatsapp-contacts.md](https://github.com/bitboom/pcc-ref/blob/4baf997394629ad6e39790e38ede3a7768fa2f35/meta/wiki/sources/meta-private-processing/ipls-privacy-preserving-storage-for-your-whatsapp-contacts.md)</p>
</article>
<article class="evidence-card" data-pcc-ref="meta/wiki/sources/meta-private-processing/private-processing-technical-whitepaper.md">
<h3>Private Processing for WhatsApp Overview</h3>
<p>Official Meta technical whitepaper detailing the Private Processing architecture, threat model, and security design.</p>
<p><span class="evidence-pill">official-primary</span> <span class="evidence-pill">whitepaper</span></p>
<p class="source-path">[meta/wiki/sources/meta-private-processing/private-processing-technical-whitepaper.md](https://github.com/bitboom/pcc-ref/blob/4baf997394629ad6e39790e38ede3a7768fa2f35/meta/wiki/sources/meta-private-processing/private-processing-technical-whitepaper.md)</p>
</article>
</div>

