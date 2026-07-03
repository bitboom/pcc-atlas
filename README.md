# PCC Atlas

PCC Atlas is a public, source-backed learning site for private AI compute systems:

- Apple Private Cloud Compute
- Meta / WhatsApp Private Processing
- Google Private AI / Android Private Compute Core / Project Oak

The site consumes a local [`bitboom/pcc-ref`](https://github.com/bitboom/pcc-ref) checkout as read-only evidence during generation. Generated public docs and metadata are committed so GitHub Pages can build without accessing the private/source corpus repo.

Default local layout:

```text
~/code/pcc-ref      # evidence corpus
~/code/pcc-atlas    # this public site
```

## Local development

```bash
npm install
# Optional if pcc-ref is not checked out next to this repo:
# export PCC_REF_DIR=/path/to/pcc-ref
npm run sync:pcc-ref
npm run validate:evidence
npm test
npm run build
npm run dev
```

## Evidence boundary

`pcc-ref` is treated as a read-only local input. `npm run sync:pcc-ref` records the source commit SHA and regenerates public docs/data from the source registries. GitHub Pages uses the checked-in generated docs and metadata rather than checking out the source corpus.

## Deployment

The repo is configured for GitHub Pages through `.github/workflows/pages.yml`.

Expected public URL after repository creation and Pages deployment:

```text
https://bitboom.github.io/pcc-atlas/
```
