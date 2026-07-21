# GitHub Profile README — Hanami × Terminal

**Date:** 2026-07-15 · **Repo:** `Rejhinald/rejhinald` (profile README; currently just "Hi") · cloned to `c:\Users\Admin\Documents\Work Repo\rejhinald`

## Locked decisions
Hanami × terminal hybrid · real metrics headline + 2 GitHub stats cards (stats, top-langs — no streaks/trophies) · links: Portfolio, LinkedIn, Email, CV.

## Deliverables
1. **`assets/banner-light.svg` + `assets/banner-dark.svg`** — 1200×260 hand-authored SVG in portfolio tokens (washi `#F3EEE6` / sumi `#20242A` bg, serif name "ARWIN GERARD MICLAT", vermillion `#D9432C` 桜 hanko rotated −4°, gold `#C2A05B` hairline, tagline "Computer Engineer & Web Developer · Angeles City, PH", vertical 大阪 · OSAKA tanzaku). **Animated drifting petals** via CSS keyframes inside the SVG (works in GitHub `<img>`); generic `serif` font stack (no webfonts in SVG-as-image). Referenced through `<picture>` with `prefers-color-scheme`.
2. **`README.md`** sections, in order:
   - Banner (`<picture>` light/dark).
   - Terminal intro (```console fence): `whoami`, `uptime` (shipping since 2024 · Associate Developer @ Avorino), `currently_shipping` (avorino.com · hanami portfolio w/ procedural Three.js diorama), `cat stack.txt` one-liner.
   - Quick-links badge row (shields.io for-the-badge): Portfolio `https://arwinmiclat-portfolio.vercel.app/` (vermillion), LinkedIn `/in/arwin-miclat` (0A66C2), Email `mailto:arwinmiclat@gmail.com` (EA4335), CV `…vercel.app/cv/Arwin_Gerard_Miclat_Resume.pdf` (gold).
   - **By the numbers** (real metrics table): 37-city programmatic SEO (~150 pages · ~1,800 CMS entries) @ Avorino · 5 products shipped 2025–26 · procedural Three.js hero, quality-tiered to run on phones · RBAC wholesale platform on a 4-engineer team.
   - **Selected work** table: Avorino ★, Nexwin Capital, ADUPortal, SimpleProjex, KKB — live links + one-liners (mirrors portfolio Selected Work).
   - **Stack** (omakase groups): Frontend / Backend / Platform as badge rows.
   - **Stats**: github-readme-stats card + compact top-langs, hanami-themed params (title `D9432C`, icons `C2A05B`, transparent bg, hide_border), light/dark via `<picture>`.
   - Footer: gold rule · 桜 · "Osaka-inspired · Pampanga-built".
3. **Portfolio repo description update** (`gh repo edit Rejhinald/portfolio`): description → "Hanami-themed portfolio — Next.js 16 · React 19 · Tailwind v4 · GSAP + Lenis · procedural Three.js floating-island hero"; homepage → `https://arwinmiclat-portfolio.vercel.app/`.

## Constraints
GitHub README sanitizer: no inline styles/CSS/JS in the markdown itself — only supported HTML (`<picture>`, `<img>`, `<table>`, `<div align>`, `<details>`); all styling lives inside the SVGs or shields/stats URLs. Keep total height reasonable (~2 screens). Verify by pushing and screenshotting the live profile in both color schemes; iterate until clean.

## Plan (inline — single-file scope)
(1) `gh repo edit` portfolio description/homepage → verify via `gh repo view`. (2) Clone profile repo. (3) Author banner SVGs. (4) Author README. (5) Push. (6) Playwright-verify live profile render (light + dark, banner animates, badges load, stats cards render, no sanitized/broken blocks); fix and re-push as needed. (7) Report with screenshot; suggest re-pinning repos (pins are UI-only, no API).
