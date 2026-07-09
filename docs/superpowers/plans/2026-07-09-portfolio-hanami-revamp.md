# Portfolio Hanami Revamp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `portfolio` repo from scratch into a single-page, scroll-driven **hanami** (sakura) portfolio that borrows Avorino's editorial-luxury design philosophy in a daytime-Japan palette, with GSAP + Lenis animation, a raw-Three.js drifting-petal hero, and a "Selected Work" gallery that faithfully recreates five real product heroes (each click → live site).

**Architecture:** Next 16 App Router, single route `/`. Design tokens live in `app/globals.css` (Tailwind v4 CSS-first `@theme inline`). A once-mounted Lenis instance drives GSAP ScrollTrigger; a `data-animate` reveal hook wires all reveals inside one `gsap.context()`. Three.js runs raw inside a reusable `StagedScene` host, IntersectionObserver-gated and disposed on unmount. Sections are composed top-to-bottom in `app/page.tsx`. Showcase panels are self-contained recreations in each product's own colors, wrapped in a click-through frame.

**Tech Stack:** Next.js 16, React 19, TypeScript (strict), Tailwind CSS v4, GSAP 3 + ScrollTrigger, Lenis, three.js (raw), `motion` (nav only), Resend, Vitest + happy-dom + Testing Library, `next/font/google` (Shippori Mincho + Zen Kaku Gothic New).

**Full design spec:** `docs/superpowers/specs/2026-07-09-portfolio-hanami-revamp-design.md` — read it before starting. This plan implements it.

## Global Constraints

- **Framework:** Next.js 16 App Router, React 19, TypeScript `strict: true`, path alias `@/* → ./*` (repo root, matching existing tsconfig) — single page route `/` plus `app/api/send/route.ts`.
- **Styling:** Tailwind CSS v4 CSS-first (`@import "tailwindcss"` + `@theme inline {}` in `app/globals.css`); NO `tailwind.config.ts`. Use `cn()` = `twMerge(clsx(...))`.
- **Single light theme only.** No dark mode, no CMS, no i18n, no heavy 3D models (drifting petals only), no multi-page routing.
- **Palette (exact hex, as CSS vars):** paper `#F3EEE6`, paper-2 `#FAF6EF`, paper-3 `#EAE3D7`, ink `#20242A`, ink-2 `#333A3F`, ink-mid `#5E6870`, stone `#8C9A97`, shu `#D9432C`, shu-deep `#A83320`, gold `#C2A05B`, gold-deep `#8C6E3F`, sakura `#E8A0B4`, sakura-2 `#F4CDD6`, sakura-deep `#C97A93`, sora `#7FA9C9`, sora-deep `#3E6E8E`, wakaba `#8FA86B`, wakaba-deep `#5C7A4F`, rule `#D8CFC0`, rule-dark `#2A2E33`.
- **Fonts:** Shippori Mincho (display/headings, 400/500/600), Zen Kaku Gothic New (body/UI, 400/500). Self-hosted via `next/font/google`, `display: "swap"`, CSS vars `--font-display` / `--font-body`.
- **Performance:** all Three.js IntersectionObserver-gated + DPR ≤ 2 + reduced-motion/mobile bail + full GL disposal. Every animation path bails on `prefers-reduced-motion`. No autoplaying video anywhere.
- **Vermillion (`--wa-shu`) is reserved for primary CTAs/emphasis; gold for hairlines/rules; sakura/sora/wakaba for soft fills + petals.**
- **Build workflow:** rebuild in-place on `main`. Commit after every task. **Do NOT `git push`** — the owner controls the live flip (push auto-deploys via Vercel).
- **Package manager:** npm. Node 20+.
- **Keep as-is:** `app/favicon.ico`; the Resend contact flow (`app/api/send/route.ts`, `components/email-template.tsx`) — tidied, not replaced.
- **Verification per task:** `npx tsc --noEmit` (typecheck) + `npm run build` must pass; `npx vitest run` for tasks with tests; visual tasks verified on `npm run dev` at http://localhost:3000 (use Playwright MCP to screenshot). A task is done only when its verification passes.
- **Recreation assets are authorized:** all five showcased products are the owner's own repos; copying their logos/screenshots/SVGs for faithful recreation is allowed.

---

## File Structure

```
app/
  layout.tsx              # fonts, metadata, favicon, chrome mount (SmoothScroll, Reveal, Nav, Cursor, Preloader, Footer)
  page.tsx                # single page: Hero → About → Work → Showcases → Skills → Archive → Contact
  globals.css             # Tailwind v4 @import + @theme inline tokens + base + utilities
  api/send/route.ts       # Resend (kept, tidied)
components/
  layout/
    smooth-scroll.tsx      # Lenis provider (client)
    nav.tsx                # anchor nav, frosted-on-scroll, hide-on-scroll-down (motion)
    footer.tsx             # minimal footer + hanko seal
    preloader.tsx          # sakura curtain, ~1.5s auto-dismiss
    cursor.tsx             # sakura-dot custom cursor (desktop)
    reveal-provider.tsx    # mounts the data-animate reveal hook once
  system/
    section.tsx            # <Section surface pad id>
    container.tsx          # <Container size>
    eyebrow.tsx            # eyebrow + gold hairline
    display-heading.tsx    # mincho heading with reveal variants
    pill-button.tsx        # magnetic pill CTA (link/button)
  sections/
    hero.tsx
    about.tsx
    work.tsx
    skills.tsx
    showcases.tsx          # section wrapper + maps showcase panels
    archive.tsx
    contact.tsx
  showcases/
    showcase-frame.tsx     # click-through frame + portfolio caption
    avorino-showcase.tsx
    nexwin-showcase.tsx
    aduportal-showcase.tsx
    simpleprojex-showcase.tsx
    kkb-showcase.tsx
  three/
    staged-scene.tsx       # reusable raw-three host (client)
    petal-field.tsx        # sakura petal InstancedMesh scene
  email-template.tsx       # kept
lib/
  utils.ts                 # cn()
  data/
    profile.ts             # name, taglines, socials, contact
    work.ts                # work experience (CV three roles)
    skills.ts              # tech list
    showcases.ts           # 5 showcase meta (name, role, year, stack, href)
    archive.ts             # 5 old projects (title, tech, youtubeId, links)
  animations/
    use-reveal.ts          # data-animate → GSAP reveal, in gsap.context
    magnetic.ts            # data-magnetic helper
    sticky-progress.ts     # position:sticky scroll progress (no GSAP pin)
public/
  cv/Arwin_Gerard_Miclat_Resume.pdf
  portrait/hanami.jpg
  showcases/…              # copied product assets per showcase task
test/
  setup.ts                 # vitest + testing-library + happy-dom
vitest.config.ts
```

---

## Phase 0 — Foundation

### Task 1: Reset to a clean Next 16 + Tailwind v4 + Vitest scaffold

**Files:**
- Modify: `package.json` (deps + scripts)
- Create: `postcss.config.mjs`, `tsconfig.json` (update), `next.config.mjs` (update), `vitest.config.ts`, `test/setup.ts`, `.env.local.example`
- Delete: `tailwind.config.ts`, `app/template.tsx`, `utils/animations.ts`, `utils/cn.ts`, `components/ui/*` (Aceternity), `components/navbar-menu.tsx`, `components/lamp.tsx`, `components/flip-words.tsx`, `components/layout-grid.tsx`, `components/projects.tsx`, `components/contact.tsx`, `components/transition-link.tsx`, `components/data/data.tsx`, `app/about/`, `app/projects/`, `app/contact/`, `public/noise.webp`, `public/next.svg`, `public/vercel.svg`
- Keep: `app/favicon.ico`, `app/api/send/route.ts`, `components/email-template.tsx`, `components/images/icons/*` (may reuse some), `docs/`

**Interfaces:**
- Produces: working `npm run dev`/`build`/`lint`/`vitest`; alias `@/*`; Tailwind v4 pipeline.

- [ ] **Step 1:** Update `package.json` dependencies. Set:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "gsap": "^3.13.0",
    "lenis": "^1.3.0",
    "three": "^0.184.0",
    "motion": "^12.0.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "lucide-react": "^0.460.0",
    "resend": "^4.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/three": "^0.184.0",
    "eslint": "^9",
    "eslint-config-next": "^16.0.0",
    "vitest": "^2.1.0",
    "@vitejs/plugin-react": "^4.3.0",
    "happy-dom": "^15.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.5.0"
  }
}
```
Remove: `@popperjs/core`, `@react-hook/window-size`, `framer-motion`, `react-icons`, `autoprefixer`, `postcss` (v4 plugin replaces), old `tailwindcss` 3.

- [ ] **Step 2:** Delete the files/dirs listed under **Delete** above. Run:
```bash
rm -rf tailwind.config.ts app/template.tsx utils components/ui components/navbar-menu.tsx components/lamp.tsx components/flip-words.tsx components/layout-grid.tsx components/projects.tsx components/contact.tsx components/transition-link.tsx components/data app/about app/projects app/contact public/noise.webp public/next.svg public/vercel.svg
```

- [ ] **Step 3:** Write `postcss.config.mjs`:
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

- [ ] **Step 4:** Update `tsconfig.json` `compilerOptions.paths` to `{ "@/*": ["./*"] }`, ensure `"strict": true`, `"moduleResolution": "bundler"`, and `types` includes nothing test-specific (vitest handled by its config). Keep the Next plugin.

- [ ] **Step 5:** Write `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "happy-dom", globals: true, setupFiles: ["./test/setup.ts"] },
  resolve: { alias: { "@": resolve(__dirname, ".") } },
});
```

- [ ] **Step 6:** Write `test/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 7:** Write `.env.local.example` with `RESEND_API_KEY=` and a note. Update `next.config.mjs` to a minimal `const nextConfig = {}; export default nextConfig;` (drop the old remote-image wildcard; we self-host assets).

- [ ] **Step 8:** Install and verify.
```bash
npm install
npx tsc --noEmit
```
Expected: install succeeds; typecheck passes (no app files reference deleted modules yet — `app/layout.tsx`/`app/page.tsx` still reference old components, so first fix them minimally to empty stubs in Step 9).

- [ ] **Step 9:** Stub `app/layout.tsx` (minimal root layout, `<html lang="en"><body>{children}</body></html>`, keep favicon `<link>` + metadata title "Arwin Gerard Miclat — Portfolio") and `app/page.tsx` (`export default function Home(){ return <main /> }`). Rewrite `app/globals.css` to just `@import "tailwindcss";` for now. Then:
```bash
npx tsc --noEmit && npm run build
```
Expected: build succeeds.

- [ ] **Step 10:** Commit.
```bash
git add -A && git commit -m "chore: reset to Next 16 + Tailwind v4 + Vitest scaffold"
```

---

### Task 2: Design tokens, fonts, and base utilities

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`
- Create: `lib/utils.ts`, `lib/utils.test.ts`

**Interfaces:**
- Produces: CSS vars `--wa-*` + Tailwind color utilities (`bg-paper`, `text-ink`, `text-shu`, `border-rule`, …); font vars `--font-display`/`--font-body`; utility classes `.display`, `.eyebrow`, `.gold-rule`, `.wa-container`, `.section-pad`; `cn(...classes)`.

- [ ] **Step 1:** Write `lib/utils.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges and dedupes tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-ink", false && "hidden", "font-bold")).toBe("text-ink font-bold");
  });
});
```

- [ ] **Step 2:** Run `npx vitest run lib/utils.test.ts` — expect FAIL (module missing).

- [ ] **Step 3:** Write `lib/utils.ts`:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4:** Run `npx vitest run lib/utils.test.ts` — expect PASS.

- [ ] **Step 5:** Write `app/globals.css` — full token system:
```css
@import "tailwindcss";

:root {
  --wa-paper: #F3EEE6; --wa-paper-2: #FAF6EF; --wa-paper-3: #EAE3D7;
  --wa-ink: #20242A; --wa-ink-2: #333A3F; --wa-ink-mid: #5E6870; --wa-stone: #8C9A97;
  --wa-shu: #D9432C; --wa-shu-deep: #A83320;
  --wa-gold: #C2A05B; --wa-gold-deep: #8C6E3F;
  --wa-sakura: #E8A0B4; --wa-sakura-2: #F4CDD6; --wa-sakura-deep: #C97A93;
  --wa-sora: #7FA9C9; --wa-sora-deep: #3E6E8E;
  --wa-wakaba: #8FA86B; --wa-wakaba-deep: #5C7A4F;
  --wa-rule: #D8CFC0; --wa-rule-dark: #2A2E33;
  --text-hero: clamp(3rem, 7vw, 6rem);
  --text-page-title: clamp(2.5rem, 5vw, 4.5rem);
  --text-section-title: clamp(2rem, 4vw, 3.5rem);
  --text-card-title: clamp(1.4rem, 2.5vw, 2rem);
}

@theme inline {
  --color-paper: var(--wa-paper); --color-paper-2: var(--wa-paper-2); --color-paper-3: var(--wa-paper-3);
  --color-ink: var(--wa-ink); --color-ink-2: var(--wa-ink-2); --color-ink-mid: var(--wa-ink-mid); --color-stone: var(--wa-stone);
  --color-shu: var(--wa-shu); --color-shu-deep: var(--wa-shu-deep);
  --color-gold: var(--wa-gold); --color-gold-deep: var(--wa-gold-deep);
  --color-sakura: var(--wa-sakura); --color-sakura-2: var(--wa-sakura-2); --color-sakura-deep: var(--wa-sakura-deep);
  --color-sora: var(--wa-sora); --color-sora-deep: var(--wa-sora-deep);
  --color-wakaba: var(--wa-wakaba); --color-wakaba-deep: var(--wa-wakaba-deep);
  --color-rule: var(--wa-rule); --color-rule-dark: var(--wa-rule-dark);
  --font-display: var(--font-shippori); --font-body: var(--font-zen);
}

@layer base {
  html { -webkit-font-smoothing: antialiased; }
  body { background: var(--wa-paper); color: var(--wa-ink); font-family: var(--font-body), system-ui, sans-serif; }
  h1,h2,h3,h4,h5,h6 { font-family: var(--font-display), Georgia, serif; letter-spacing: -0.015em; line-height: 1.02; }
  ::selection { background: var(--wa-sakura); color: var(--wa-ink); }
}

@layer utilities {
  .display { font-family: var(--font-display), Georgia, serif; letter-spacing: -0.015em; }
  .eyebrow { font-size: 0.75rem; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 500; color: var(--wa-ink-mid); }
  .gold-rule { display: inline-block; width: 56px; height: 1px; background: var(--wa-gold); }
  .wa-container { max-width: 80rem; margin-inline: auto; padding-inline: clamp(1rem, 4vw, 2.5rem); }
  .wa-container-narrow { max-width: 56rem; margin-inline: auto; padding-inline: clamp(1rem, 4vw, 2.5rem); }
  .section-pad { padding-block: clamp(4rem, 8vw, 7rem); }
}
```

- [ ] **Step 6:** Load fonts in `app/layout.tsx`:
```tsx
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
const shippori = Shippori_Mincho({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-shippori", display: "swap" });
const zen = Zen_Kaku_Gothic_New({ subsets: ["latin"], weight: ["400","500"], variable: "--font-zen", display: "swap" });
```
Apply `className={`${shippori.variable} ${zen.variable}`}` on `<html>`. Import `./globals.css`.

- [ ] **Step 7:** Temporarily render a token check in `app/page.tsx` (a heading in `.display`, an `.eyebrow` + `.gold-rule`, swatches `bg-paper`, `bg-shu`, `text-sakura`). Run `npm run dev`, screenshot http://localhost:3000 with Playwright MCP, confirm mincho serif heading + hanami colors render. Revert `page.tsx` to `<main />` after.

- [ ] **Step 8:** `npx tsc --noEmit && npm run build && npx vitest run` — all pass. Commit:
```bash
git add -A && git commit -m "feat: hanami design tokens, fonts, cn util"
```

---

## Phase 1 — Core Systems

### Task 3: Lenis smooth scroll + GSAP registration

**Files:**
- Create: `components/layout/smooth-scroll.tsx`
- Modify: `app/layout.tsx` (wrap children)

**Interfaces:**
- Produces: `<SmoothScroll>` client provider that mounts one Lenis instance, pumps it via `gsap.ticker`, syncs `ScrollTrigger.update`, and bails on `prefers-reduced-motion`. Registers `ScrollTrigger` globally.

- [ ] **Step 1:** Write `components/layout/smooth-scroll.tsx`:
```tsx
"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      wheelMultiplier: 1.1,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(raf); lenis.destroy(); };
  }, []);
  return <>{children}</>;
}
```

- [ ] **Step 2:** In `app/layout.tsx`, wrap `{children}` with `<SmoothScroll>`. (Keep `<main>` inside.)

- [ ] **Step 3:** Add a temporary tall spacer in `app/page.tsx` (two `100vh` divs), `npm run dev`, confirm smooth wheel scroll in browser (Playwright: scroll and verify no error in console). Remove spacer.

- [ ] **Step 4:** `npx tsc --noEmit && npm run build`. Commit:
```bash
git add -A && git commit -m "feat: Lenis smooth scroll + GSAP/ScrollTrigger wiring"
```

---

### Task 4: Reveal system (`data-animate`) + magnetic + sticky-progress

**Files:**
- Create: `lib/animations/use-reveal.ts`, `lib/animations/use-reveal.test.ts`, `lib/animations/magnetic.ts`, `lib/animations/sticky-progress.ts`, `components/layout/reveal-provider.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces:
  - `useReveal()` — hook run once by `<RevealProvider>`; queries `[data-animate]`, wires GSAP reveals in a `gsap.context()`, returns cleanup. Kinds: `fade-up`, `fade-up-stagger`, `word-stagger`, `blur-focus`, `line-wipe`, `parallax`.
  - `splitIntoWords(el: HTMLElement): void` — wraps each word in `<span class="wa-word">` preserving spaces (exported for tests).
  - `applyMagnetic(el: HTMLElement): () => void` — attaches magnetic pointer effect, returns cleanup.
  - `createStickyProgress(section: HTMLElement, onProgress: (p: number) => void): () => void` — scroll-driven 0→1 progress via `getBoundingClientRect`, rAF-throttled, IO-paused; returns cleanup.

- [ ] **Step 1:** Write `lib/animations/use-reveal.test.ts` (tests only the pure DOM helper, not GSAP):
```ts
import { describe, it, expect } from "vitest";
import { splitIntoWords } from "@/lib/animations/use-reveal";

describe("splitIntoWords", () => {
  it("wraps each word and preserves text content", () => {
    const el = document.createElement("h1");
    el.textContent = "Arwin Gerard Miclat";
    splitIntoWords(el);
    expect(el.querySelectorAll(".wa-word").length).toBe(3);
    expect(el.textContent).toBe("Arwin Gerard Miclat");
  });
});
```

- [ ] **Step 2:** Run `npx vitest run lib/animations/use-reveal.test.ts` — expect FAIL.

- [ ] **Step 3:** Write `lib/animations/use-reveal.ts`. Include `splitIntoWords` (word-level, spaces preserved as text nodes between spans) and `useReveal` that, inside `gsap.context()`, iterates `[data-animate]` and applies the variant's tween with `scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" }`; bail entirely on reduced-motion (just clear inline hidden state). Remove the `data-animate` attr after wiring (idempotent). Reveal recipe reference (fade-up): `gsap.set(el,{y:50,opacity:0,filter:"blur(4px)"})` → `gsap.to(el,{y:0,opacity:1,filter:"blur(0px)",duration:1.1,ease:"power3.out",scrollTrigger:{...}})`. Return `() => ctx.revert()`.

- [ ] **Step 4:** Run the test — expect PASS.

- [ ] **Step 5:** Write `lib/animations/magnetic.ts` (`applyMagnetic`: on pointermove within bounds, `gsap.to(el,{x:dx*0.25,y:dy*0.25,duration:0.4})`; on leave, elastic return to 0; desktop + non-reduced-motion only) and `lib/animations/sticky-progress.ts` (`createStickyProgress`: passive scroll listener → one rAF → compute progress from rect vs viewport; IntersectionObserver pauses when off-screen; cleanup removes listeners/observer).

- [ ] **Step 6:** Write `components/layout/reveal-provider.tsx`:
```tsx
"use client";
import { useEffect } from "react";
import { useReveal } from "@/lib/animations/use-reveal";
export function RevealProvider() { useReveal(); return null; }
```
Mount `<RevealProvider />` in `app/layout.tsx` (inside `<SmoothScroll>`, before `<main>`).

- [ ] **Step 7:** Add `.wa-word { display:inline-block; }` to globals utilities. Temporarily add `<h2 data-animate="fade-up">Test</h2>` far down `page.tsx`; `npm run dev`; Playwright-scroll to it; confirm it reveals. Remove test markup.

- [ ] **Step 8:** `npx tsc --noEmit && npm run build && npx vitest run`. Commit:
```bash
git add -A && git commit -m "feat: GSAP reveal system, magnetic buttons, sticky-progress"
```

---

### Task 5: StagedScene host + sakura petal field

**Files:**
- Create: `components/three/staged-scene.tsx`, `components/three/petal-field.tsx`, `components/three/petal-field.test.ts`

**Interfaces:**
- Consumes: none (self-contained three.js).
- Produces:
  - `<StagedScene className? init={(ctx: SceneContext) => (() => void)}>` — creates renderer/scene/camera, appends canvas to wrapper, resize handling, IO-gated rAF loop; calls `init` once with `{ scene, camera, renderer }`, expects an `onFrame(elapsed:number)=>void` returned; disposes everything on unmount (geometries, materials, `renderer.dispose()`, `forceContextLoss()`, remove canvas). DPR ≤ 2, `alpha:true`. Bail (render nothing) on reduced-motion or `innerWidth < 768`.
  - `petalCount(width: number): number` — pure: returns instance count for a viewport width (e.g. `width < 768 ? 0 : width < 1280 ? 180 : 320`). Exported for tests.
  - `<PetalField />` — client component using `StagedScene` to render a drifting sakura petal `InstancedMesh`.

- [ ] **Step 1:** Write `components/three/petal-field.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { petalCount } from "@/components/three/petal-field";

describe("petalCount", () => {
  it("returns 0 on mobile widths", () => { expect(petalCount(500)).toBe(0); });
  it("scales up on desktop", () => {
    expect(petalCount(1000)).toBeGreaterThan(0);
    expect(petalCount(1440)).toBeGreaterThan(petalCount(1000));
  });
});
```

- [ ] **Step 2:** Run test — expect FAIL.

- [ ] **Step 3:** Write `components/three/staged-scene.tsx` (the host, per Interfaces; model on Avorino's `staged-scene.tsx` pattern: `useEffect`, wrapper ref, renderer with `setPixelRatio(Math.min(devicePixelRatio,2))`, `ResizeObserver`, IO to gate `requestAnimationFrame`, full disposal). Export `type SceneContext`.

- [ ] **Step 4:** Write `components/three/petal-field.tsx`. Export pure `petalCount(width)`. `<PetalField>` builds an `InstancedMesh` of a small petal geometry (a `PlaneGeometry` or 5-vertex sakura-petal shape) with a soft pink material (`--wa-sakura`/white, `transparent`, `depthWrite:false`); per-instance state arrays (position, fall speed, sway phase, rotation); `onFrame` updates each instance matrix (fall + sine sway + slow rotation + wind drift), wrapping petals to the top when they exit the bottom. Camera static; subtle depth fog. Use `petalCount(window.innerWidth)`; if 0, render nothing.

- [ ] **Step 5:** Run petal test — expect PASS.

- [ ] **Step 6:** Temporarily mount `<PetalField />` full-screen in `page.tsx`; `npm run dev`; Playwright screenshot; confirm petals drift over the paper background with no console errors; confirm canvas is removed cleanly on route re-render (check no WebGL context warnings). Remove temporary mount.

- [ ] **Step 7:** `npx tsc --noEmit && npm run build && npx vitest run`. Commit:
```bash
git add -A && git commit -m "feat: raw-three StagedScene host + sakura petal field"
```

---

### Task 6: Chrome — Nav, Footer, Preloader, Cursor

**Files:**
- Create: `components/layout/nav.tsx`, `components/layout/footer.tsx`, `components/layout/preloader.tsx`, `components/layout/cursor.tsx`, `lib/data/profile.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `profile` (name, socials, contact) from `lib/data/profile.ts`.
- Produces: mounted chrome. `<Nav>` = fixed anchor nav (`#about #work #selected-work #skills #archive #contact`), frosted `backdrop-blur` on scroll, hide-on-scroll-down/show-on-up via `motion.header` y-animate. `<Footer>`, `<Preloader>` (fixed curtain, sakura/torii SVG, auto-dismiss ~1.5s via state+timeout, respects reduced-motion by dismissing instantly), `<Cursor>` (sakura-dot lerp follower, desktop + non-reduced-motion only, hidden on touch).

- [ ] **Step 1:** Write `lib/data/profile.ts`:
```ts
export const profile = {
  name: "Arwin Gerard Miclat",
  firstName: "Arwin Gerard",
  lastName: "Miclat",
  role: "Computer Engineer & Web Developer",
  eyebrow: "ようこそ · WELCOME",
  subhead: "Computer engineer & web developer crafting cinematic, high-performance interfaces.",
  location: "Angeles City, Pampanga",
  email: "arwinmiclat@gmail.com",
  phone: "+63 922 746 6200",
  cvHref: "/cv/Arwin_Gerard_Miclat_Resume.pdf",
  socials: [
    { name: "GitHub", url: "https://github.com/Rejhinald" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/arwin-miclat/" },
    { name: "Facebook", url: "https://www.facebook.com/Zeihji/" },
    { name: "Instagram", url: "https://www.instagram.com/arwnmclt/" },
  ],
  nav: [
    { label: "About", href: "#about" },
    { label: "Work", href: "#work" },
    { label: "Selected Work", href: "#selected-work" },
    { label: "Skills", href: "#skills" },
    { label: "Archive", href: "#archive" },
    { label: "Contact", href: "#contact" },
  ],
} as const;
```

- [ ] **Step 2:** Write `components/layout/nav.tsx` (client; `motion` from `motion/react`; reads `profile.nav`; frosted-on-scroll via scroll listener; hide-on-scroll-down). Keep it minimal and on-theme (paper/ink, gold hairline underline on hover, vermillion CTA "Let's talk" → `#contact`).

- [ ] **Step 3:** Write `components/layout/footer.tsx` (ink surface, name + socials + back-to-top + a hanko-style vermillion seal glyph + credit line).

- [ ] **Step 4:** Write `components/layout/preloader.tsx` (client; fixed full-screen paper curtain with a small sakura/torii SVG + name; auto-dismiss after ~1500ms via GSAP fade or CSS; if reduced-motion, dismiss immediately).

- [ ] **Step 5:** Write `components/layout/cursor.tsx` (client; a small sakura-pink dot that lerps toward pointer via rAF; `pointer: fine` + non-reduced-motion only; hidden otherwise).

- [ ] **Step 6:** Mount in `app/layout.tsx` order: `<Preloader/>`, `<SmoothScroll>`, `<RevealProvider/>`, `<Cursor/>`, `<Nav/>`, `<main>{children}</main>`, `<Footer/>`.

- [ ] **Step 7:** `npm run dev`; Playwright screenshot desktop + mobile viewport; confirm nav frost/hide, preloader dismiss, cursor (desktop), footer. No console errors.

- [ ] **Step 8:** `npx tsc --noEmit && npm run build`. Commit:
```bash
git add -A && git commit -m "feat: chrome — nav, footer, preloader, cursor + profile data"
```

---

## Phase 2 — System Primitives & Content Sections

### Task 7: System primitives (Section, Container, Eyebrow, DisplayHeading, PillButton)

**Files:**
- Create: `components/system/section.tsx`, `container.tsx`, `eyebrow.tsx`, `display-heading.tsx`, `pill-button.tsx`

**Interfaces:**
- Produces:
  - `<Section id? surface="paper"|"paper-2"|"ink" pad?=boolean className?>` — semantic `<section>` with surface bg + `.section-pad`.
  - `<Container size="default"|"narrow"|"wide">`.
  - `<Eyebrow>` — renders `.eyebrow` text + `.gold-rule` under it; accepts `children`.
  - `<DisplayHeading as="h1"|"h2" animate?="line-wipe"|"word-stagger"|"fade-up" className?>` — mincho heading carrying the right `data-animate`.
  - `<PillButton href?|onClick? variant="solid"|"ghost" magnetic?=true>` — vermillion solid or ghost pill; if `href`, renders `<a>`; attaches `data-magnetic`.

- [ ] **Step 1:** Write all five primitives (small, focused files) using `cn()` and the tokens. `PillButton` solid = `bg-shu text-paper hover:bg-shu-deep rounded-full px-8 py-4`; ghost = `border border-rule text-ink hover:border-gold`. Both include a trailing arrow that translates on hover.

- [ ] **Step 2:** Render a temporary composition in `page.tsx` (Section > Container > Eyebrow + DisplayHeading + PillButton). `npm run dev`; Playwright screenshot; confirm editorial look. Remove temp.

- [ ] **Step 3:** `npx tsc --noEmit && npm run build`. Commit:
```bash
git add -A && git commit -m "feat: system primitives (section, container, eyebrow, heading, pill)"
```

---

### Task 8: Hero section

**Files:**
- Create: `components/sections/hero.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `profile`, `<PetalField>`, `<PillButton>`, `<Eyebrow>`.
- Produces: `<Hero>` — full-viewport (`100svh`) sky→paper gradient stage with `<PetalField>` behind, faint corner castle/torii line-art SVG, bottom-left lockup (Eyebrow `ようこそ · WELCOME` → serif name two-line clip-wipe "Arwin Gerard"/"Miclat" via `data-animate="line-wipe"` → subhead → PillButton "View work" (#selected-work) + ghost "Download CV" (cvHref)), centered scroll indicator.

- [ ] **Step 1:** Write `components/sections/hero.tsx` per Interfaces. Gradient: `background: linear-gradient(to bottom, var(--wa-sora) 0%, color-mix(in srgb, var(--wa-sora) 30%, var(--wa-paper)) 45%, var(--wa-paper) 100%)`. Petals absolute inset-0 behind content; content `absolute bottom-16 left-[clamp(1rem,4vw,2.5rem)] max-w-[42rem]`. Corner mark: small inline SVG (simple castle/torii lines) at low opacity, top-right.

- [ ] **Step 2:** Set `app/page.tsx` to render `<Hero/>` first (import). `npm run dev`; Playwright screenshot; confirm petals + bottom-left mincho name + gradient sky + CTAs; verify "Download CV" link points at the PDF (add the PDF in Step 3 first if needed for a 200).

- [ ] **Step 3:** Copy the CV PDF: `mkdir -p public/cv && cp "C:/Users/Admin/Downloads/Arwin_Gerard_Miclat_Resume.pdf" public/cv/Arwin_Gerard_Miclat_Resume.pdf`. Copy the hanami portrait: `mkdir -p public/portrait && cp "C:/Users/Admin/Downloads/IMG_2233(1).jpg" public/portrait/hanami.jpg`.

- [ ] **Step 4:** `npx tsc --noEmit && npm run build`. Commit:
```bash
git add -A && git commit -m "feat: hero section with petal field + name-forward lockup + CV/portrait assets"
```

---

### Task 9: About section

**Files:**
- Create: `components/sections/about.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `profile`, portrait `public/portrait/hanami.jpg`, `<Section id="about">`, `<Eyebrow>`, `<DisplayHeading>`.
- Produces: `<About>` — editorial two-column: left = full hanami photo (`next/image`, rounded, subtle gold hairline frame); right = eyebrow (`自己紹介 · ABOUT`), serif heading, bio paragraph (from CV interests + summary), and a "現在 / NOW" line ("Associate Developer @ Avorino"). Reveal-animated.

- [ ] **Step 1:** Write `components/sections/about.tsx`. Bio copy (from CV): a 2–3 sentence intro covering Computer Engineering background, focus on cinematic high-performance web (Next.js/GSAP/Three.js), and interests (video essays, problem-solving, hardware tinkering). Photo via `next/image` with `sizes` + `priority={false}`.

- [ ] **Step 2:** Add `<About/>` after `<Hero/>` in `page.tsx`. `npm run dev`; Playwright screenshot; confirm photo + bio render, reveal fires on scroll.

- [ ] **Step 3:** `npx tsc --noEmit && npm run build`. Commit:
```bash
git add -A && git commit -m "feat: about section with hanami portrait + bio"
```

---

### Task 10: Work Experience section

**Files:**
- Create: `components/sections/work.tsx`, `lib/data/work.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `work` array, `<Section id="work">`.
- Produces: `<Work>` — editorial timeline/list of the three CV roles, each with company, role, dates, and 2–4 highlight bullets; reveal-staggered.

- [ ] **Step 1:** Write `lib/data/work.ts` (typed array). Content from CV:
```ts
export const work = [
  { company: "Avorino", role: "Associate Developer", period: "Mar 2025 – Present",
    highlights: [
      "Sole developer of the marketing site across a three-repo Next.js/TypeScript stack on Cloudflare Workers — scroll-driven GSAP, Three.js scenes, Lenis smooth scroll.",
      "Built a Gemini-powered ADU cost estimator and a lead-gen funnel with Google Ads attribution and first-party analytics feeding an internal CRM.",
      "Shipped a programmatic local-SEO system across 37 cities (~150 pages, ~1,800 CMS entries)."
    ] },
  { company: "USA Wholesale Supplies", role: "Junior Web Developer (Part-Time)", period: "Jun 2025 – Jul 2026",
    highlights: [
      "Core developer on UW Portal (Next.js + Express/Supabase) — inventory & product-lifecycle management with a full RBAC system.",
      "Scaled data-heavy tables with server-driven infinite scroll + PostgreSQL index tuning; built advanced table UX with dark mode + Recharts dashboard."
    ] },
  { company: "Hooli Software", role: "Software Engineer Intern", period: "Nov 2024 – Feb 2025",
    highlights: [
      "Drove frontend + backend enhancements on a SaaS product in Agile/Scrum, improving stability and UX.",
      "Resolved performance and integration issues through refactoring and continuous feedback."
    ] },
] as const;
```

- [ ] **Step 2:** Write `components/sections/work.tsx` (maps `work`; gold hairline dividers; dates in stone; `data-animate="fade-up-stagger"`). Optionally wire `createStickyProgress` for a subtle sticky heading — keep simple if time-boxed.

- [ ] **Step 3:** Add `<Work/>` after `<About/>`. `npm run dev`; Playwright screenshot; confirm roles + reveals.

- [ ] **Step 4:** `npx tsc --noEmit && npm run build`. Commit:
```bash
git add -A && git commit -m "feat: work experience section from CV"
```

---

### Task 11: Skills section

**Files:**
- Create: `components/sections/skills.tsx`, `lib/data/skills.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `skills` array, `<Section id="skills">`.
- Produces: `<Skills>` — animated grid/wrap of the CV tech stack, grouped (Frontend / Backend / Tooling), reveal-staggered.

- [ ] **Step 1:** Write `lib/data/skills.ts`:
```ts
export const skills = {
  Frontend: ["Next.js","React","TypeScript","Tailwind CSS","Shadcn/ui","GSAP","Three.js","Framer Motion","Recharts"],
  Backend: ["Bun","Hono","Drizzle ORM","PostgreSQL","Zod","React Hook Form","TanStack Query"],
  Platform: ["Cloudflare Workers","Cloudflare R2","Google Gemini AI","JustCall API"],
} as const;
```

- [ ] **Step 2:** Write `components/sections/skills.tsx` (grouped chips; chips = paper-2 with gold hairline border, ink text; stagger reveal). Reuse existing `components/images/icons/*` SVGs where a matching icon exists (optional).

- [ ] **Step 3:** (Skills goes AFTER showcases per spec order, but build it now; final order set in Task 20.) `npm run dev`; screenshot; confirm.

- [ ] **Step 4:** `npx tsc --noEmit && npm run build`. Commit:
```bash
git add -A && git commit -m "feat: skills section from CV stack"
```

---

## Phase 3 — Selected Work (five recreations)

> Each showcase recreates the product's **above-the-fold hero only**, in the product's **own** colors/fonts (NOT the hanami palette — these are faithful previews). The whole panel is a single click-through to the live site. Recreate by **reading the exact source hero component** listed and mirroring its layout/copy/colors at preview scale. Copy any needed assets (logos/screenshots/SVGs) into `public/showcases/<product>/`. Keep each recreation self-contained (scoped classes / inline styles) so its palette never leaks into the portfolio.

### Task 12: Showcase data + click-through frame + section

**Files:**
- Create: `lib/data/showcases.ts`, `components/showcases/showcase-frame.tsx`, `components/sections/showcases.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces:
  - `showcases` array: `{ key, name, role, year, stack, href }` for avorino, nexwin, aduportal, simpleprojex, kkb (order per spec).
  - `<ShowcaseFrame name role year stack href>{recreation}</ShowcaseFrame>` — wraps a recreation in a full-bleed panel: renders the child recreation as the visual, overlays a portfolio-styled caption (eyebrow name · role · year · stack · "Visit site ↗"), and makes the entire panel a link/button to `href` (opens new tab, `rel="noopener noreferrer"`). Hover lifts + reveals a "Visit" affordance. `aria-label` = "Open {name} (opens in new tab)".
  - `<Showcases>` — `<Section id="selected-work">` with intro heading, then maps the five recreation components through `ShowcaseFrame`.

- [ ] **Step 1:** Write `lib/data/showcases.ts`:
```ts
export const showcases = [
  { key: "avorino", name: "Avorino", role: "Associate Developer", year: "2025", stack: "Next.js · GSAP · Three.js · Cloudflare", href: "https://avorino.com" },
  { key: "nexwin", name: "Nexwin Capital", role: "Sole Developer", year: "2026", stack: "Next.js · Bun/Hono · Three.js · Cloudflare", href: "https://nexwincapital.com" },
  { key: "aduportal", name: "ADUPortal", role: "Developer", year: "2026", stack: "Next.js · Turborepo · Bun/Hono", href: "https://aduportal.com" },
  { key: "simpleprojex", name: "SimpleProjex", role: "SimpleProjex", year: "Ongoing", stack: "Next.js · Tailwind v4 · Framer Motion", href: "https://simpleprojex.com" },
  { key: "kkb", name: "KKB — Kanya-Kanyang Bayad", role: "Solo Developer", year: "2026", stack: "Next.js · Tailwind v4 · shadcn", href: "https://kkb-three.vercel.app" },
] as const;
```

- [ ] **Step 2:** Write `components/showcases/showcase-frame.tsx` (per Interfaces). The frame is the sakura-portfolio chrome around each foreign-palette recreation: a paper-2 mat with gold hairline, the recreation inset inside a browser-ish rounded card, caption below/overlay. Whole card is an `<a target="_blank">`.

- [ ] **Step 3:** Write `components/sections/showcases.tsx` importing the five recreation components (created in Tasks 13–17) — for now stub the five imports with empty placeholders so the section compiles; each subsequent task fills one in.

- [ ] **Step 4:** Add `<Showcases/>` after `<Work/>`. `npx tsc --noEmit && npm run build`. Commit:
```bash
git add -A && git commit -m "feat: showcase data + click-through frame + section scaffold"
```

### Task 13: Avorino recreation

**Files:** Create `components/showcases/avorino-showcase.tsx`; assets → `public/showcases/avorino/`.
**Source to mirror:** `C:/Users/Admin/Documents/Work Repo/avorino-app/avorino-app/src/components/sections/hero.tsx` + `avorino-home.css`.
**Recreate:** dark inset rounded card; muted full-bleed background (use a static gradient/image stand-in — NO autoplay video); bottom-left lockup: eyebrow → 56px **gold** line → DM-Serif-Display title with per-line reveal → subtitle → cream pill CTA. **Own palette:** paper `#E8E4DF`, ink `#111111`, red `#C8222A`, gold `#C9A96E`. Load DM Serif Display + DM Sans locally for this panel only (scoped) or via a `next/font` instance. Keep it self-contained.

- [ ] **Step 1:** Read the source hero; recreate above-the-fold faithfully at panel scale.
- [ ] **Step 2:** Wire into `showcases.tsx` via `ShowcaseFrame` (href avorino.com).
- [ ] **Step 3:** `npm run dev`; Playwright screenshot; compare against avorino.com hero for fidelity.
- [ ] **Step 4:** `npx tsc --noEmit && npm run build`. Commit `feat: avorino showcase recreation`.

### Task 14: Nexwin Capital recreation

**Files:** Create `components/showcases/nexwin-showcase.tsx`; assets → `public/showcases/nexwin/`.
**Source to mirror:** `C:/Users/Admin/Documents/Work Repo/nextwin-app/src/components/sections/home-hero.tsx`, `home-hero-title.tsx`, `shared/hero-canvas.tsx` (for the look only — do NOT port the 3D).
**Recreate:** dark navy card (`#0B1220`); **lightweight static stand-in** for the gold-wireframe capital-flow motif (a CSS/SVG suggestion of wireframe grid + gold nodes + one animated gold pulse is enough); bottom-left eyebrow ("Orange County-founded · California-licensed loan broker…") → H1 "Funding **your Next Win.**" (last phrase `font-light italic`) → subhead ("Real estate capital that moves when you do…") → cream→red pill "Find your fit · 2 min". **Own palette:** paper `#E8E4DF`, ink `#111`, red `#C8222A`, gold `#B5945A`/`#E7C074`, navy `#0B1220`. DM Serif Display + DM Sans.

- [ ] **Step 1:** Read source; recreate hero faithfully with a static/SVG wireframe stand-in.
- [ ] **Step 2:** Wire into `showcases.tsx` (href nexwincapital.com).
- [ ] **Step 3:** `npm run dev`; screenshot; compare to nexwincapital.com.
- [ ] **Step 4:** `npx tsc --noEmit && npm run build`. Commit `feat: nexwin capital showcase recreation`.

### Task 15: ADUPortal recreation

**Files:** Create `components/showcases/aduportal-showcase.tsx`; assets → `public/showcases/aduportal/`.
**Source to mirror:** `C:/Users/Admin/Documents/Work Repo/adu-portal/apps/web/components/pages/home/home-page-client.tsx`; tokens `packages/ui/styles/globals.css`.
**Recreate:** light hero, white surface with lime+teal radial glows; centered headline "Plan Your ADU with Clear Cost, Financing, and ROI Insight"; subhead; 3 pill CTAs (teal solid "Get My Free ADU Estimate" / white-outline "Explore All Tools" / lime "What is an ADU?"); star row; the **asymmetric bento "planning cockpit"** (5 tilted cards + gradient connector with an animated lime dot). **Own palette:** primary teal `#073f42`, accent `#15927f`, lime `#dbffc2`, page `#dfe5e8`, amber `#f0b429`. Font DM Sans. Copy any hero images from `apps/web/public/images/home/` if needed, else use tasteful placeholders matching the card layout.

- [ ] **Step 1:** Read source; recreate hero + bento faithfully.
- [ ] **Step 2:** Wire into `showcases.tsx` (href aduportal.com).
- [ ] **Step 3:** `npm run dev`; screenshot; compare to aduportal.com.
- [ ] **Step 4:** `npx tsc --noEmit && npm run build`. Commit `feat: aduportal showcase recreation`.

### Task 16: SimpleProjex recreation

**Files:** Create `components/showcases/simpleprojex-showcase.tsx`; assets → `public/showcases/simpleprojex/`.
**Source to mirror:** `C:/Users/Admin/Documents/Work Repo/landing/components/features/sections/hero-section.tsx`; tokens `assets/styles/globals.css`; fonts `lib/fonts.ts`.
**Recreate:** white→pale-blue gradient with **floating rotating construction-tool SVGs** + blue radial mesh; two-column (left copy / right **macOS-window product-demo mockup** with screenshot bento). Pill "🚀 From Estimates to Cash Flow", H1 "Win More Construction Bids with **Smarter Proposals**" (last two words in brand blue), subhead, email-capture input + "Get Started" button (static/no submit — the whole panel links out). **Own palette:** brand blue `#3B9EFB`, brand-light `#EBF4FE`, orange `#F0A62B`, text `#2B2724`. Fonts Source Serif 4 (titles) + Inter, light weight. Copy the tool SVGs from `landing/public/*.svg` (saw/hammer/etc.) into `public/showcases/simpleprojex/`.

- [ ] **Step 1:** Read source; recreate hero (copy tool SVGs) faithfully.
- [ ] **Step 2:** Wire into `showcases.tsx` (href simpleprojex.com).
- [ ] **Step 3:** `npm run dev`; screenshot; compare to simpleprojex.com.
- [ ] **Step 4:** `npx tsc --noEmit && npm run build`. Commit `feat: simpleprojex showcase recreation`.

### Task 17: KKB recreation

**Files:** Create `components/showcases/kkb-showcase.tsx`; assets → `public/showcases/kkb/`.
**Source to mirror:** `C:/Users/Admin/Documents/Work Repo/kkb/src/app/page.tsx`, `globals.css`, `src/components/kkb/*`, `ui/*`.
**Recreate:** **neobrutalism** — ash-blue bg `#d4dde8`; KKB logo (copy `kkb/public/logo_light.svg` → `public/showcases/kkb/logo.svg`); `border-2` near-black (`#1a1a1a`) borders; hard `4px 4px 0 0` offset shadows; a compact single-column bill-split card mock (title input, amount card with `₱`, chunky accent quick-amount buttons yellow `#f2e017`/pink `#ff77b4`/green `#34dd88`/orange `#ffa64d`, electric-blue `#2f6bf5` primary); press-into-page hover on buttons. Font Geist.

- [ ] **Step 1:** Read source; recreate the neobrutalism main screen faithfully (copy the logo SVG).
- [ ] **Step 2:** Wire into `showcases.tsx` (href kkb-three.vercel.app).
- [ ] **Step 3:** `npm run dev`; screenshot; compare to kkb-three.vercel.app.
- [ ] **Step 4:** `npx tsc --noEmit && npm run build`. Commit `feat: kkb showcase recreation`.

---

## Phase 4 — Archive, Contact, Assembly, Cleanup

### Task 18: Archive section (poster + click-to-play, no autoplay)

**Files:**
- Create: `components/sections/archive.tsx`, `components/sections/archive-item.tsx`, `lib/data/archive.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `archive` array, `<Section id="archive" surface="paper-3">`.
- Produces: compact grid of old projects. Each `<ArchiveItem>` = YouTube **poster facade**: shows `https://i.ytimg.com/vi/<id>/hqdefault.jpg` with a play button; clicking swaps in the iframe (`?autoplay=1` only AFTER click — never on load). Tech chips + live/GitHub links.

- [ ] **Step 1:** Extract the 5 projects + YouTube IDs from git history of the old `components/projects.tsx` (retrieve via `git show HEAD~something:components/projects.tsx` or the reflog; the pre-reset commit contains them). Write `lib/data/archive.ts` with `{ title, tech: string[], youtubeId, liveHref?, githubHref? }` for Delivio, Poem.io, Spotify Clone, Hotel Management System, San Luis Tourism.

- [ ] **Step 2:** Write `components/sections/archive-item.tsx` (client): state `playing`; render poster `<img>` + play overlay until clicked, then the iframe. No autoplay before click.

- [ ] **Step 3:** Write `components/sections/archive.tsx` (grid + heading "Archive / これまで").

- [ ] **Step 4:** Add `<Archive/>` to `page.tsx`. `npm run dev`; Playwright: confirm NO network request to youtube embed on load; confirm click loads the player.

- [ ] **Step 5:** `npx tsc --noEmit && npm run build`. Commit:
```bash
git add -A && git commit -m "feat: archive section with poster + click-to-play (no autoplay)"
```

### Task 19: Contact section + tidy Resend route

**Files:**
- Create: `components/sections/contact.tsx`
- Modify: `app/api/send/route.ts`, `components/email-template.tsx`, `app/page.tsx`

**Interfaces:**
- Consumes: `profile`, `POST /api/send`.
- Produces: `<Contact id="contact">` — Resend form (name/email/message) + Download CV button + direct links (email, GitHub, LinkedIn, Facebook, Instagram, phone, location). Subtle petal/sky background. `/api/send` keeps validating all three fields → 400; tidy the hardcoded `from`/subject.

- [ ] **Step 1:** Write `app/api/send/route.ts` test-lite: keep the existing handler; ensure it returns 400 when a field is missing and 200 on success (Resend call). Tidy `from` to a branded sender string (still `onboarding@resend.dev` until a domain is verified) and destination `arwinmiclat@gmail.com`.

- [ ] **Step 2:** Write `components/sections/contact.tsx` (client form posting JSON to `/api/send`; status states; on-theme styling; PillButton "Send" vermillion; ghost "Download CV").

- [ ] **Step 3:** Add `<Contact/>` last in `page.tsx`. `npm run dev`; submit with `RESEND_API_KEY` set locally (or mock) → confirm success path; confirm CV downloads.

- [ ] **Step 4:** `npx tsc --noEmit && npm run build`. Commit:
```bash
git add -A && git commit -m "feat: contact section + tidy Resend route"
```

### Task 20: Assemble page order, metadata, SEO, reduced-motion audit

**Files:**
- Modify: `app/page.tsx`, `app/layout.tsx`

**Interfaces:**
- Produces: final section order `Hero → About → Work → Showcases (Selected Work) → Skills → Archive → Contact`; complete metadata (title, description, OpenGraph, favicon kept); `lang="en"`.

- [ ] **Step 1:** Set final import order in `app/page.tsx` per spec §5.
- [ ] **Step 2:** Fill `app/layout.tsx` metadata: title "Arwin Gerard Miclat — Web Developer", description from the hero subhead, OpenGraph (use the hanami portrait or a generated OG), keep `<link rel="icon" href="/favicon.ico">`.
- [ ] **Step 3:** Audit reduced-motion: with `prefers-reduced-motion` emulated (Playwright `reducedMotion: "reduce"`), confirm petals off, reveals show content immediately (no invisible content), cursor hidden, preloader instant. Fix any stuck-hidden content.
- [ ] **Step 4:** `npx tsc --noEmit && npm run build`. Commit:
```bash
git add -A && git commit -m "feat: assemble page order + metadata + reduced-motion audit"
```

### Task 21: Performance pass + dead-code cleanup + final verification

**Files:**
- Modify: sections for `content-visibility`; `components/three/*` for dynamic import; remove any leftover unused files/deps/icons.

- [ ] **Step 1:** Add `content-visibility:auto; contain-intrinsic-size` to off-screen heavy sections (Showcases, Archive) via a utility class (exclude any sticky-progress section). Lazy-load `<PetalField>` via `next/dynamic({ ssr: false })`; lazy-load heavy showcase panels via `next/dynamic` if bundle is large.
- [ ] **Step 2:** Remove unused `components/images/icons/*` not referenced; confirm no dead imports; run `npm run lint` and fix.
- [ ] **Step 3:** Full verification: `npx tsc --noEmit && npm run lint && npm run build && npx vitest run`. Then `npm run dev` and Playwright: screenshot the full page top-to-bottom (desktop + mobile), confirm no console errors, no horizontal scroll, petals gated, all five showcases click through to correct live URLs (verify `href` targets).
- [ ] **Step 4:** Commit:
```bash
git add -A && git commit -m "perf: content-visibility, dynamic imports, dead-code cleanup + final verification"
```
- [ ] **Step 5:** STOP. Report to owner that the rebuild is complete and verified locally, and ask for approval before `git push` (push auto-deploys via Vercel).

---

## Self-Review (completed against spec)

- **Spec coverage:** stack (Task 1), tokens/fonts (Task 2), Lenis (Task 3), reveal/magnetic/sticky (Task 4), petals+host (Task 5), chrome (Task 6), primitives (Task 7), hero (Task 8), about (Task 9), work (Task 10), skills (Task 11), showcases ×5 (Tasks 12–17), archive (Task 18), contact+Resend (Task 19), assembly/metadata/reduced-motion (Task 20), perf/cleanup (Task 21). All spec §§3–13 map to tasks.
- **Placeholder scan:** system/foundation tasks carry complete code; showcase tasks intentionally reference the exact source file to mirror (faithful recreation requires reading each product's real hero at build time) with all captured colors/copy/fonts embedded — this is direction, not a vague placeholder.
- **Type consistency:** `cn`, `petalCount`, `splitIntoWords`, `createStickyProgress`, `applyMagnetic`, `profile`, `work`, `skills`, `showcases`, `archive`, `ShowcaseFrame` props are named identically across the tasks that define and consume them.
- **No-autoplay guarantee:** Task 18 (archive) uses a poster facade; Tasks 13/14 explicitly forbid porting autoplay video/3D. Verified in Task 20/21 audits.
```
