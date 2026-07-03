# PROJECT KNOWLEDGE BASE

**Generated:** 2026-07-03
**Commit:** ebfa3b0
**Branch:** main

## OVERVIEW

PCC Atlas is an Astro/Starlight public learning site about private AI compute
systems. The evidence corpus and Python ingestion tools live in the pinned
`data/pcc-ref` Git submodule and must remain read-only from this site repo.

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
|-- .github/workflows/         # GitHub Pages deployment
|-- .gitmodules                # pins bitboom/pcc-ref at data/pcc-ref
`-- data/pcc-ref/              # submodule with corpus, scripts, tests
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| Understand repo purpose | `README.md` | Public site and evidence boundary. |
| Visual system | `DESIGN.md` | Must be updated before UI/component changes. |
| Site config | `astro.config.mjs` | Starlight sidebar and GitHub Pages base path. |
| Generate docs/data | `scripts/sync-pcc-ref.mjs` | Reads submodule and writes site-owned generated pages. |
| Validate evidence | `scripts/validate-evidence.mjs` | Fails on missing pinned source paths. |
| Work on the corpus | `data/pcc-ref/` | Submodule-owned evidence workspace; do not edit from site tasks. |
| Apple PCC docs | `data/pcc-ref/apple/` | Largest vendor tree. |
| Shared Python helpers | `data/pcc-ref/shared/` | Stdlib-only support code. |
| Cross-vendor synthesis | `data/pcc-ref/cross-vendor/` | Citation-heavy comparison corpus. |

## CODE MAP

| Symbol/File | Type | Location | Role |
|---|---|---|---|
| `data/pcc-ref` | submodule | `.gitmodules` | Pinned `bitboom/pcc-ref` evidence tree. |
| `ingest_pcc.py` | CLI | `data/pcc-ref/apple/scripts/` | Primary staged Apple pipeline. |
| `shared.pcc_ref_ingest` | package | `data/pcc-ref/shared/` | Reused stdlib helpers. |
| `test_shared.py` | unittest | `data/pcc-ref/tests/` | Shared helper regression tests. |

## CONVENTIONS

- Treat `data/pcc-ref` as a submodule boundary, not ordinary copied content.
- Keep local runtime state out of source control: `.omx/`, `.hermes/`, `.omo/`, logs.
- Run `npm run sync:pcc-ref` before building so generated docs reflect the pinned corpus.
- Use `data-pcc-ref="repo/path.md"` on source-backed evidence cards; validation depends on it.
- Keep public site claims either source-backed or explicitly caveated.
- Do not edit `data/pcc-ref` files for site work; update the submodule pointer only deliberately.

## ANTI-PATTERNS

- Do not assume `npm`, Docker, Make, or CI workflows exist at the root.
- Do not move files out of `data/pcc-ref` to make the layout look conventional.
- Do not hand-edit generated corpus files from the wrapper root.
- Do not treat the root README as the full project specification.

## COMMANDS

```bash
git submodule update --init --recursive
npm install
npm run sync:pcc-ref
npm run validate:evidence
npm test
npm run build
cd data/pcc-ref && python3 -m unittest tests.test_shared -v && python3 shared/scripts/verify_registry.py --quiet
```

## NOTES

The root repo answers "what is PCC Atlas?" The `data/pcc-ref` submodule answers
"what evidence exists, how was it captured, and how is it verified?"
