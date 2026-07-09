# Portfolio Hanami Revamp — Design Spec

**Date:** 2026-07-09
**Owner:** Arwin Gerard Miclat
**Repo:** `portfolio` (Vercel, auto-deploys on push to `main`)

## 1. Vision

A single-page, scroll-driven **hanami (cherry-blossom) portfolio**. It takes the *design philosophy* of the Avorino marketing site — editorial-luxury pacing, a GSAP-driven reveal architecture, Lenis smooth scroll, disciplined raw-Three.js, magnetic buttons, a custom cursor — and renders it in a **daytime-hanami palette** derived from the owner's Osaka-Castle-in-spring photo: soft sky, washi paper, sumi ink, torii vermillion, sakura pink, muted gold hairlines. The hero carries drifting sakura petals in Three.js. A "Selected Work" gallery faithfully recreates the above-the-fold hero of five real products, each clicking through to its live site.

This is a **ground-up rebuild** replacing the current Next 14 / Aceternity / dark-forced portfolio.

## 2. Goals & Non-Goals

**Goals**
- Modern stack matching Avorino (Next 16, React 19, Tailwind v4, GSAP, Lenis, raw Three.js, TS strict), deployed on Vercel.
- A cohesive, authentically-Japanese light visual system translated from Avorino's token structure.
- Fast: petals and animations must not block; single light theme; self-hosted fonts; lazy/gated 3D.
- Faithful recreations of 5 product heroes (Avorino, Nexwin Capital, ADUPortal, SimpleProjex, KKB), each a clickable preview → live site.
- Content refreshed from the current CV (work experience, skills, projects, education, certs, contact).
- Old projects preserved but de-emphasized in an archive; **no autoplaying video**.

**Non-Goals (YAGNI)**
- No CMS, blog, or i18n.
- No dark mode (single light hanami theme).
- No heavy 3D models — **drifting petals only** as the hero 3D.
- No dashboards, auth, or backend beyond the existing Resend contact endpoint.
- No multi-page routing — single-page scroll with anchor nav.

## 3. Tech Stack & Architecture

| Area | Choice |
|---|---|
| Framework | Next.js 16, App Router, single route `/` (+ `/api/send`) |
| Language | TypeScript, `strict: true`, path alias `@/*` |
| Styling | Tailwind CSS v4 (CSS-first `@theme inline` in `globals.css`, no config file) + `cn()` (`twMerge(clsx())`) |
| Scroll animation | GSAP 3 + ScrollTrigger |
| Smooth scroll | Lenis, pumped by `gsap.ticker`, synced to ScrollTrigger |
| 3D | Raw Three.js (no R3F) for the petal field |
| React animation | `motion` (Framer Motion) only where React-stateful (nav) |
| Email | Resend (keep existing `/api/send` route + `email-template.tsx`, tidy the `from`/`to`) |
| Fonts | `next/font/google`, self-hosted, only used weights |
| Deploy | Vercel; **rebuild on `main`**; local build, push gated on owner approval |

**Dependency cleanup:** remove `@popperjs/core`, `@react-hook/window-size`, and the redundant `framer-motion`/`motion`/`gsap` overlap; drop unused Aceternity components (`background-boxes`, `lamp`, `tracing-beam`, `flip-words`, `layout-grid`, dead `ui/navbar-menu.tsx`) and the unused `public/noise.webp`. **Keep** `app/favicon.ico` unchanged.

**Source layout (target):**
```
app/
  layout.tsx            # fonts, metadata, chrome mount, favicon
  page.tsx              # single-page: all sections in order
  globals.css           # Tailwind v4 @import + @theme inline tokens + base utilities
  api/send/route.ts     # Resend (kept, tidied)
components/
  layout/               # SmoothScroll, Nav, Footer, Preloader, Cursor
  system/               # Section, Container, Eyebrow, DisplayHeading, PillButton, StagedScene host
  sections/             # Hero, About, Work, Showcases, Skills, Archive, Contact
  showcases/            # one recreation component per product (Avorino, Nexwin, ADUPortal, SimpleProjex, KKB)
  three/                # petal-field scene
lib/
  animations/           # useReveal hook (data-animate), sticky-progress, magnetic
  data/                 # portfolio content (work, skills, projects, socials, showcases)
  utils.ts              # cn()
public/
  cv/Arwin_Gerard_Miclat_Resume.pdf
  showcases/            # copied product assets (logos, screenshots) as needed
  portrait/             # hanami portrait
```

## 4. Visual System (hanami translation of Avorino's tokens)

All tokens as CSS variables in `:root`, mirrored into Tailwind `@theme inline`.

**Color palette**
| Role | Token | Hex |
|---|---|---|
| Washi paper (page bg) | `--wa-paper` | `#F3EEE6` |
| Washi raised | `--wa-paper-2` | `#FAF6EF` |
| Washi sunken | `--wa-paper-3` | `#EAE3D7` |
| Sumi ink (text) | `--wa-ink` | `#20242A` |
| Ink 2 | `--wa-ink-2` | `#333A3F` |
| Ink mid | `--wa-ink-mid` | `#5E6870` |
| Stone | `--wa-stone` | `#8C9A97` |
| Shu vermillion (CTA/punch) | `--wa-shu` | `#D9432C` |
| Shu deep | `--wa-shu-deep` | `#A83320` |
| Kin gold (hairlines) | `--wa-gold` | `#C2A05B` |
| Kin deep | `--wa-gold-deep` | `#8C6E3F` |
| Sakura pink (soft accent) | `--wa-sakura` | `#E8A0B4` |
| Sakura light | `--wa-sakura-2` | `#F4CDD6` |
| Sakura deep | `--wa-sakura-deep` | `#C97A93` |
| Sora/ai sky-blue | `--wa-sora` | `#7FA9C9` |
| Sora deep | `--wa-sora-deep` | `#3E6E8E` |
| Wakaba spring green | `--wa-wakaba` | `#8FA86B` |
| Wakaba deep | `--wa-wakaba-deep` | `#5C7A4F` |
| Rule (border) | `--wa-rule` | `#D8CFC0` |
| Rule dark | `--wa-rule-dark` | `#2A2E33` |

`::selection` = sakura pink on ink. Vermillion is reserved for primary CTAs and rare emphasis; gold for hairlines/rules; sakura/sora/wakaba for soft fills, backgrounds, and the petals.

**Typography**
- Display / headings: **Shippori Mincho** (Japanese mincho serif; covers Latin + kana + kanji), weights 400/500/600.
- Body / UI: **Zen Kaku Gothic New** (Japanese gothic; covers Latin + kana), weights 400/500.
- One typeface family covers occasional kanji accents (e.g. 桜) — no third font.
- Fluid `clamp()` scale (tokens): hero `clamp(3rem,7vw,6rem)`, page-title `clamp(2.5rem,5vw,4.5rem)`, section-title `clamp(2rem,4vw,3.5rem)`, card-title `clamp(1.4rem,2.5vw,2rem)`, eyebrow `0.75rem`.
- Utilities: `.display` (mincho, tight tracking, line-height ~1.0), `.eyebrow` (0.75rem, `letter-spacing:0.3em`, uppercase, weight 500), `.rule` / gold hairline under eyebrows.

**Spacing / radii / layout**
- Radii small & editorial: `2px…16px`, pills `100px`.
- Section rhythm: `padding-block: clamp(4rem,8vw,7rem)`.
- Containers: default `max-width:80rem`, narrow `56rem`, wide `96rem`, inline padding `clamp(1rem,4vw,2.5rem)`.
- Documented z-index ladder (base → cursor → preloader).

## 5. Page Structure (single-page scroll)

Order in `app/page.tsx`:

1. **Preloader** — brief sakura/torii curtain, auto-dismiss ~1.5s.
2. **Hero** — §6.
3. **About** — editorial bio from CV + interests; hanami **portrait**; a "現在 / now" line (Associate Developer @ Avorino).
4. **Work Experience** — Avorino · USA Wholesale Supplies · Hooli Software; dates + highlight bullets; reveal-animated (optional sticky-scrub timeline).
5. **Selected Work** — §8, the five recreated hero panels.
6. **Skills / Toolbox** — animated grid of the CV tech stack.
7. **Archive** — §9, old projects, poster + click-to-play.
8. **Contact** — §10, Resend form + Download CV + direct links.
9. **Footer** — minimal: name, socials, back-to-top, hanko-seal motif.

**Chrome:** frosted anchor-nav (hide-on-scroll-down / show-on-up), sakura-dot custom cursor (desktop, non-reduced-motion), Lenis smooth scroll, GSAP reveal system.

## 6. Hero

- Full-viewport (`100svh`) daytime-sky stage: soft gradient sky-blue (`--wa-sora`) → washi.
- **Three.js drifting sakura petals** (§7) full-bleed behind content.
- Faint far line-art **castle/torii** corner mark (echo of Avorino's blueprint corner), very low opacity.
- **Bottom-left editorial lockup (name-forward editorial):**
  - Eyebrow: `ようこそ · WELCOME` (kanji/kana accent + gold hairline under it).
  - **Mincho serif name** as the hero, two lines with per-line clip-wipe reveal: "Arwin Gerard" / "Miclat".
  - Subhead: "Computer engineer & web developer crafting cinematic, high-performance interfaces."
  - Magnetic **vermillion pill** ("View work") + ghost "Download CV".
- Centered scroll indicator (label + hairline + animated dot).

## 7. Three.js Petal Field

- Reusable **StagedScene host** (renderer/scene/camera/resize/rAF), modeled on Avorino's `staged-scene.tsx`.
- Petals as **`InstancedMesh`** (~200–400 instances), each with per-instance drift (fall), sway (sine), wind, rotation; semi-transparent sakura pink/white; soft depth fade.
- **Performance guards:** `renderer.setPixelRatio(Math.min(dpr,2))`, `alpha:true`; IntersectionObserver gates the rAF loop; bail on `prefers-reduced-motion`; reduced count or disabled on mobile (`innerWidth` threshold); full geometry/material/renderer disposal + `forceContextLoss()` on unmount; canvas forced to 100%/100% via CSS.

## 8. Selected Work — Five Recreated Heroes

Each showcase is a **faithful above-the-fold recreation in the product's own colors/fonts**, presented as a full-bleed panel with a portfolio-styled caption (name · role · year · stack · "Visit site ↗"). **Any click on the panel → live site** (new tab). GSAP handles inter-panel transitions. Order & sources:

**1. Avorino** — https://avorino.com — *Associate Developer, 2025–Present*
- Source: `avorino-app/avorino-app/src/components/sections/hero.tsx` + `avorino-home.css`.
- Recreate: dark inset rounded card, muted full-bleed background, bottom-left serif lockup (eyebrow → gold line → serif title with per-line clip-wipe → subtitle → magnetic pill). Own palette: paper `#E8E4DF`, ink `#111`, red `#C8222A`, gold `#C9A96E`. Fonts DM Serif Display + DM Sans. (Static/muted background stand-in for the video — no autoplay video.)

**2. Nexwin Capital** — https://nexwincapital.com — *Sole Developer (site + Bun/Hono API + dashboard), 2026*
- Source: `nextwin-app/src/components/sections/home-hero.tsx`, `home-hero-title.tsx`, `shared/hero-canvas.tsx`.
- Recreate: dark navy card, bottom-left eyebrow → H1 "Funding **your Next Win.**" (italic light emphasis) → subhead → cream→red pill "Find your fit · 2 min". Own palette: ink `#111`, paper `#E8E4DF`, red `#C8222A`, gold `#B5945A`/`#E7C074`, navy `#0B1220`. A lightweight recreation of the gold-wireframe "capital-flow" motif (or a faithful static stand-in) is acceptable; do not port the full 3D scene.

**3. ADUPortal** — https://aduportal.com — *Developer, 2026*
- Source: `adu-portal/apps/web/components/pages/home/home-page-client.tsx`; tokens `packages/ui/styles/globals.css`.
- Recreate: light hero with lime+teal radial glows, centered headline "Plan Your ADU with Clear Cost, Financing, and ROI Insight", 3 pill CTAs (teal / white-outline / lime), star row, and the asymmetric **bento "planning cockpit"** with the animated lime connector dot. Own palette: teal `#073f42`, accent `#15927f`, lime `#dbffc2`, page `#dfe5e8`, amber `#f0b429`. Font DM Sans.

**4. SimpleProjex** — https://simpleprojex.com — *SimpleProjex, ongoing*
- Source: `landing/components/features/sections/hero-section.tsx`; tokens `assets/styles/globals.css`; fonts `lib/fonts.ts`.
- Recreate: white→pale-blue gradient with **floating rotating construction-tool SVGs** + blue radial mesh; two-column (copy left / **macOS-window product-demo mockup** with screenshot bento right). Pill "🚀 From Estimates to Cash Flow", H1 "Win More Construction Bids with **Smarter Proposals**", email-capture + "Get Started". Own palette: brand blue `#3B9EFB`, brand-light `#EBF4FE`, orange `#F0A62B`, text `#2B2724`. Fonts Source Serif 4 + Inter, light weight. Copy the tool SVGs/screenshots from the repo's `public/`.

**5. KKB (Kanya-Kanyang Bayad)** — https://kkb-three.vercel.app — *Solo Developer, 2026*
- Source: `kkb/src/app/page.tsx`, `globals.css`, `src/components/kkb/*`, `ui/*`.
- Recreate: **neobrutalism** — ash-blue bg `#d4dde8`, KKB logo, `border-2` near-black borders, hard `4px 4px 0` offset shadows, chunky accent buttons (electric blue `#2f6bf5` + yellow/pink/green/orange), press-into-page hover. Font Geist. Copy the actual KKB logo SVG from `public/`.

All five are the owner's own projects; copying their assets/screenshots for recreation is authorized.

## 9. Archive (old projects)

Compact grid, de-emphasized, below Selected Work. Five projects from the current `components/projects.tsx`:
Delivio · Poem.io · Spotify Clone · Hotel Management System · San Luis Tourism.
- Replace autoplaying YouTube iframes with **static poster thumbnails**; the player loads only on click (facade). Keep tech chips + live/GitHub links. Reuse the existing YouTube video IDs.

## 10. Skills / About / Work / Contact (content from CV)

**Skills grid:** Next.js, React, TypeScript, Tailwind CSS, Shadcn/ui, Google Gemini AI, GSAP, Three.js, Framer Motion, Recharts, React Hook Form, Zod, Drizzle ORM, PostgreSQL, Cloudflare Workers, Bun, Hono, TanStack Query, JustCall API, Cloudflare R2.

**Work Experience:**
- **Avorino** — Associate Developer — Mar 2025–Present.
- **USA Wholesale Supplies** — Junior Web Developer (Part-Time) — Jun 2025–Jul 2026.
- **Hooli Software** — Software Engineer Intern — Nov 2024–Feb 2025.
- Highlight bullets sourced from the CV.

**About:** short bio + interests (video essays, problem-solving, hardware tinkering); hanami portrait; "現在/now" line. **Education:** Holy Angel University — BS Computer Engineering — Jul 2021–Apr 2025. **Cert:** CompTIA ITF+ (Nov 2023).

**Contact:**
- Keep Resend form → `arwinmiclat@gmail.com` (tidy `from` to a verified/branded sender if available).
- **Download CV** button → `public/cv/Arwin_Gerard_Miclat_Resume.pdf`.
- Direct links: email (arwinmiclat@gmail.com), GitHub (https://github.com/Rejhinald), LinkedIn (https://www.linkedin.com/in/arwin-miclat/), Facebook (https://www.facebook.com/Zeihji/), Instagram (https://www.instagram.com/arwnmclt/), phone (+63 922 746 6200), location (Angeles City, Pampanga).
- Background: subtle petal/sky treatment.

## 11. Animation System (from Avorino)

- Single **Lenis** instance mounted once; `gsap.ticker` drives `lenis.raf`; `lenis.on('scroll', ScrollTrigger.update)`. Bail on `prefers-reduced-motion`.
- One **`data-animate` reveal hook** in a `gsap.context()`; kinds: `fade-up`, `fade-up-stagger`, `word-stagger`, `blur-focus`, `line-wipe`, `parallax`. `toggleActions: play none none none` (once). Word-level splitting only (a11y/SEO-safe), never char-level.
- **`position:sticky` scroll-scrubbing** for the work timeline and showcase transitions — **never** GSAP `pin: true` (React unmount safety).
- **Magnetic buttons** (`data-magnetic`) and count-up stats where relevant.

## 12. Performance Requirements

- IntersectionObserver-gated rAF for all Three.js; DPR ≤ 2; reduced-motion + mobile bailouts; full GL disposal.
- `content-visibility:auto` + `contain-intrinsic-size` on off-screen sections (excluding sticky-scrub sections).
- Self-hosted fonts, `display:swap`, only used weights.
- `next/dynamic` for heavy showcase panels; lazy media; poster-facade for archive videos.
- Single light theme (no dark-mode CSS overhead).
- Reveal system must never leave content invisible for no-JS/crawlers/reduced-motion.

## 13. Build & Deploy

- Rebuild **in-place on `main`** (owner's choice). Site will be half-migrated during the rebuild.
- Build and verify locally; **do not push without owner approval** (push auto-deploys via Vercel CI/CD). Owner controls the live-flip moment.
- Keep `app/favicon.ico`; keep `/api/send`; set `RESEND_API_KEY` locally to test contact.

## 14. Resolved Decisions (finalized 2026-07-09)

1. **Hero copy** — name-forward editorial lockup (see §6): eyebrow `ようこそ · WELCOME`, serif name "Arwin Gerard / Miclat", subhead "Computer engineer & web developer crafting cinematic, high-performance interfaces."
2. **Socials** — GitHub `Rejhinald`, LinkedIn `arwin-miclat`, Facebook `Zeihji`, Instagram `arwnmclt` (from old `data.tsx`; confirmed current).
3. **Nexwin/Avorino showcases** — **lightweight/static stand-in** with a subtle animated hint; do **not** port the full 3D scenes.
4. **About portrait** — use the **full hanami photo** (owner + Osaka Castle + sakura).
5. **Work Experience** — the **CV's three roles only** (Avorino, USA Wholesale Supplies, Hooli Software); earlier roles omitted.
6. **Build workflow** — rebuild in-place on `main`; build/verify locally; push gated on owner approval.

## 15. Success Criteria

- New Next 16 site builds and runs; old Aceternity/dark portfolio fully replaced.
- Hanami design system implemented as Tailwind v4 tokens; Shippori Mincho + Zen Kaku Gothic New loaded.
- Hero petals run smoothly, gated and disposed, off on reduced-motion/mobile.
- All five showcases faithfully recreated and click through to their live sites.
- No autoplaying video anywhere; archive uses poster + click-to-play.
- Content matches the CV; contact form sends; CV downloads.
- Lighthouse: no blocking 3D/fonts; smooth scroll; reduced-motion respected.
