# PCC Atlas Design System

## Purpose

PCC Atlas is a technical editorial atlas for private AI compute systems. The interface should make source-backed architecture understandable without becoming a generic SaaS landing page.

## Voice

- Precise, evidence-first, calm.
- Prefer “source-backed”, “pinned corpus”, “not documented in ingested sources”.
- Avoid hype language and vague claims.

## Visual direction

- Documentation-first shell with a custom atlas homepage.
- Dense but readable comparison tables.
- Evidence cards and trust-boundary diagrams are the signature components.
- Use restrained vendor accents, not brand cloning.

## Tokens

### Typography

- Body: system sans (`SF Pro Text`, `Segoe UI`, system UI).
- Mono: `SF Mono`, Menlo, Consolas for paths, hashes, source IDs.
- Use type scale before adding decorative boxes.

### Color

- Canvas: warm neutral white / graphite dark mode.
- Apple accent: system blue (`#2563eb`).
- Meta accent: muted green (`#059669`).
- Google accent: violet-blue (`#7c3aed`) to avoid copying Google brand colors while keeping distinction.
- Border: quiet blue-gray.

### Spacing and shape

- Cards: 16–24px radius, 1px border, subtle elevation.
- Evidence pills: rounded, mono-friendly, compact.
- Trust-boundary nodes: dashed border to signal conceptual model rather than product UI.

## Components

- `hero-atlas`: homepage explanation + source stats + pinned commit.
- `project-card`: one card per vendor track with vendor accent top border.
- `trust-boundary`: grid of boundary nodes.
- `evidence-card`: source-backed claim card with tier/kind pills and repo path.
- `stat-pill`: count/commit metadata.
- `source-path`: mono repo link.

## Accessibility

- Do not encode meaning only by color; labels must name Apple/Meta/Google.
- Evidence links must be textual and keyboard reachable.
- Tables must preserve header rows and readable line length.
- Dark mode contrast must be checked after each visual change.

## Must not have

- No aggressive gradients, fake metrics, decorative dashboards, or stock illustrations.
- No uncited architectural claims.
- No raw local paths or internal agent artifacts in public pages.
- No copying vendor visual identity beyond small neutral accent colors.
