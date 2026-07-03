# PCC Atlas

PCC Atlas is a public, source-backed learning site for private AI compute systems:

- Apple Private Cloud Compute
- Meta / WhatsApp Private Processing
- Google Private AI / Android Private Compute Core / Project Oak

The site consumes [`bitboom/pcc-ref`](https://github.com/bitboom/pcc-ref) as pinned read-only evidence under `data/pcc-ref`.

## Local development

```bash
git submodule update --init --recursive
npm install
npm run sync:pcc-ref
npm run validate:evidence
npm test
npm run build
npm run dev
```

## Evidence boundary

`data/pcc-ref` is a Git submodule pinned to a known commit. Site pages are generated from the current source registries and cross-vendor synthesis pages. Every public claim should either link to a pinned pcc-ref source path or be marked as not documented in ingested sources.

## Deployment

The repo is configured for GitHub Pages through `.github/workflows/pages.yml`.

Expected public URL after repository creation and Pages deployment:

```text
https://bitboom.github.io/pcc-atlas/
```
