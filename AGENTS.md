# PROJECT KNOWLEDGE BASE

**Generated:** 2026-07-03
**Commit:** ebfa3b0
**Branch:** main

## OVERVIEW

PCC Atlas v1 is an Astro/Starlight public, diagram-first, source-backed learning
atlas about private AI compute systems. The evidence corpus is consumed from a
local read-only `pcc-ref` checkout (default sibling path `../pcc-ref` or
`$PCC_REF_DIR`) and regenerated into checked-in docs/data.

## STRUCTURE

```text
pcc-atlas/
|-- README.md                  # site purpose and evidence boundary
|-- DESIGN.md                  # visual system contract
|-- astro.config.mjs           # Starlight/GitHub Pages config
|-- package.json               # npm scripts and Astro dependencies
|-- scripts/                   # corpus sync and evidence validation
|-- src/content/docs/          # generated/public documentation pages
|-- src/data/                  # generated corpus metadata
|-- tests/                     # Node static/evidence tests
`-- .github/workflows/         # GitHub Pages deployment
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| Understand repo purpose | `README.md` | Public site and evidence boundary. |
| Visual system | `DESIGN.md` | SVG-first and evidence-backed; must be updated before UI/component changes. |
| Site config | `astro.config.mjs` | Starlight sidebar and GitHub Pages base path. |
| Generate docs/data | `scripts/sync-pcc-ref.mjs` | Reads local corpus and writes site-owned generated pages. |
| Validate evidence | `scripts/validate-evidence.mjs` | Fails on missing pinned source paths. |
| Work on the source corpus | `../pcc-ref/` or `$PCC_REF_DIR` | Read-only input; do not edit from site tasks. |
| Apple PCC docs | `../pcc-ref/apple/` | Largest vendor tree in the source corpus. |
| Shared Python helpers | `../pcc-ref/shared/` | Stdlib-only support code in the source corpus. |
| Cross-vendor synthesis | `../pcc-ref/cross-vendor/` | Citation-heavy comparison corpus. |

## CODE MAP

| Symbol/File | Type | Location | Role |
|---|---|---|---|
| `../pcc-ref` / `$PCC_REF_DIR` | local corpus | Read-only `bitboom/pcc-ref` evidence tree used by sync scripts. |
| `scripts/sync-pcc-ref.mjs` | generator | Creates Starlight docs and source metadata from corpus registries. |
| `scripts/validate-evidence.mjs` | validator | Checks `data-pcc-ref` references against the local corpus when available. |
| `test_shared.py` | corpus unittest | Run from the source corpus when changing ingestion helpers. |

## CONVENTIONS

- Treat `../pcc-ref` / `$PCC_REF_DIR` as a read-only corpus boundary, not copied content.
- Keep local runtime state out of source control: `.omx/`, `.hermes/`, `.omo/`, logs.
- Run `npm run sync:pcc-ref` before building so generated docs reflect the pinned corpus.
- Use `data-pcc-ref="repo/path.md"` on source-backed evidence cards; validation depends on it.
- Keep public site claims either source-backed or explicitly caveated.
- Prefer site-native learning surfaces, especially SVG diagrams, comparison
  tables, and evidence cards; raw Markdown/source links are secondary.
- Unknown dimensions must render exactly: `Not documented in ingested sources`.
- Do not edit source corpus files for site work; regenerate public docs/data instead.

## ANTI-PATTERNS

- Do not assume `npm`, Docker, Make, or CI workflows exist at the root.
- Do not copy raw corpus files into the public repo unless they have been deliberately curated for publication.
- Do not hand-edit generated corpus files from the wrapper root.
- Do not treat the root README as the full project specification.

## COMMANDS

```bash
npm install
npm run sync:pcc-ref
npm run validate:evidence
npm test
npm run build
cd ../pcc-ref && python3 -m unittest tests.test_shared -v && python3 shared/scripts/verify_registry.py --quiet
```

## NOTES

The root repo answers "what is PCC Atlas?" The sibling `pcc-ref` checkout answers
"what evidence exists, how was it captured, and how is it verified?"
