# Uniqueness Pass — Graphic Signature System

**Date:** 2026-07-15
**Owner:** Arwin Gerard Miclat
**Repo:** `portfolio` (Vercel, push-to-main deploys; gh must be switched to Rejhinald before push)

## 1. Vision

The site has a strong hanami base (3D diorama hero, palette, type) but everything below the fold is template rhythm: eyebrow → serif heading → uniform stack on flat paper. This pass adds a **coherent graphic signature system** — washi materiality, a mounted-print viewport frame, ghost kanji, hanko seals, menu grammar, and a scroll-choreographed showcase — drawn from bold Japanese editorial/restaurant design, **without changing the palette, fonts, or the hero**.

Sourced from a 28-move audit (4 finders + judge, `design-for-ai` doctrine: every surface gets one named signature move; avoid AI-tells; asymmetry with discipline). Locked decisions: **Kanji Spine** showcase, **Foundation + Signatures** scope, **Tokonoma Frame** yes (frame only, no progress rail).

## 2. Goals & Non-Goals

**Goals**
- Kill the three loudest AI-tells: uniform section rhythm, pill-chip tag cloud, identical stacked showcase frames.
- One signature move per surface; all moves share one design vocabulary (numbering, seals, rules).
- Pure CSS/SVG/GSAP within existing stack — no new dependencies, no palette/font changes.
- Reduced-motion safe everywhere; mobile degrades gracefully (frame simplifies, rail collapses inline, columns stack).

**Non-Goals (YAGNI / deferred to a later "garnish" pass)**
- No hero/diorama changes. No re-theme. No tilted Archive collage, ink-envelope Contact, right-edge progress rail, or petal-shed hover (phase-3 garnish, revisit after this ships). No new pages.

## 3. Shared Vocabulary (cohesion rules — binding)

- **Numbering:** sections use formal kanji numerals 壱 弐 参 肆 伍 陸 (About→Contact), rendered ONLY via `<Hanko>` seals and `<SectionRule>` labels — one counter, one glyph style. Projects in Selected Work use the same formal glyphs at giant ghost scale (visually distinct context). Work's three jobs use informal 一 二 三 to avoid a third formal counter.
- **Seal budget:** exactly ONE hanko component (`<Hanko>`). All seals on the site render through it. No cursor stamps.
- **Kanji budget:** GhostKanji appears ONLY on About (私), Skills (技), Archive (蔵), Contact (手紙) — never on Work or Selected Work (those own big numerals instead).
- **Vermillion band budget:** exactly one full-bleed shu band on the page (the Selected Work flagship). Section seams stay typographic.
- **Tilt budget:** zero resting tilts in this pass (reserved for the future Archive collage).

## 4. The Moves

### Foundation

**4.1 Washi Grain** — `app/globals.css`
Two-frequency SVG `feTurbulence` noise as data-URIs on `body::before` (fixed, pointer-events-none, z-0): fine tooth (baseFrequency ~0.9, opacity 0.05, multiply) + coarse mottle (~0.012, opacity 0.03). Inverted fine grain (overlay, 0.08) on the ink footer. Pure static CSS.

**4.2 Tokonoma Frame** — new `components/layout/tokonoma-frame.tsx`, mounted in `app/layout.tsx`
Fixed pointer-events-none overlay: 1.5px sumi border inset ~12px around the viewport + 1px gold hairline 4px further in (desktop ≥lg). Bottom-left: small `writing-mode: vertical-rl` tanzaku label `大阪 · OSAKA — 二〇二六`. Top-right: 6px shu square tick. Mobile: ink border only, inset 8px, no label. z-index above content, below nav/preloader/cursor. Nav + scroll indicator paddings adjusted so lines never double.

**4.3 Ink & Vermillion States** — `nav.tsx`, `footer.tsx`, `cursor.tsx`, `globals.css`
- Nav links: 4px shu dot pops in (scale spring) on hover, stays lit for the section currently in view (IntersectionObserver on section ids).
- Footer links: gold dotted underline → solid shu on hover.
- Global `:focus-visible`: 2px shu outline, 2px offset (replaces default ring).
- Footer-scoped `::selection`: paper on shu.
- Cursor dot morphs to a thin shu ring (scale 2.2, 1.5px border, transparent fill) over links/buttons.

**4.4 Kohaze Rules** — new `components/system/section-rule.tsx`, replacing the plain seams between all sections
1px rule interrupted at 22% from the left; the gap holds a 6px shu tick + the section's formal kanji numeral (small, stone); a gold dotted leader runs from 78% to the right margin. Static, `aria-hidden`. On mobile the gap moves to 12% and the leader drops.

### Signatures

**4.5 Ghost Kanji Bleed** — new `components/system/ghost-kanji.tsx`
One `clamp(14rem,34vw,30rem)` Shippori kanji per allowed section (私 技 蔵 手紙), absolutely positioned bleeding off alternating edges (About: right, Skills: left, Archive: right, Contact: left), alternating top/bottom anchors. Style: transparent fill with 1px gold `-webkit-text-stroke` (Archive's 蔵 solid paper-3 for weight variety). Rides existing `data-animate="parallax"`. `aria-hidden`, z-0, sections get `overflow-x: clip`.

**4.6 Omakase Menu Board** — rewrite `components/sections/skills.tsx`
Replaces chip cloud. Three unequal columns `grid-cols-[5fr_4fr_3fr]` (stack on mobile), each hung on a full-height 1px gold rule with a `vertical-rl` group label (表 Frontend / 裏 Backend / 台 Platform). Each skill = one line: name, dotted leader (`border-bottom: 1px dotted var(--wa-gold)` on a flex filler), terminating dot — **filled shu** for daily drivers (Next.js, React, TypeScript, Tailwind, GSAP, Three.js, Cloudflare Workers, PostgreSQL), **outlined stone** otherwise. One-line legend under the heading: `● daily driver ○ in rotation`. Existing fade-up-stagger reveal.

**4.7 Kanji Spine** — rewrite `components/sections/showcases.tsx` wrapper (frames + recreations unchanged)
Desktop (≥lg): `grid-cols-[4fr_8fr]`. Left column: sticky rail (`top-24`, h-fit) showing the ACTIVE project: giant formal numeral (壱–伍) at `clamp(8rem,14vw,13rem)`, paper-3 fill with 1px gold text-stroke; project name (mincho); role · year and stack as dotted-leader rows; a 5-notch vertical hairline progress indicator (active notch shu). Right column: the existing five `ShowcaseFrame`s stacked. Per-frame `ScrollTrigger` (start "top 60%", end "bottom 60%") sets the active index; rail contents crossfade 0.35s (gsap.to opacity/y, no pin). Mobile/reduced-motion: rail hidden; each frame gets an inline header (numeral + name + meta) — reduced-motion also skips the crossfade wiring entirely.

**4.8 Shu Band Interruption** — inside Selected Work, wrapping the flagship (Avorino, 壱)
The first frame's row sits on a full-bleed shu band (`~10rem` vertical padding, `margin-inline: calc(50% - 50vw)`): paper-colored caption text, gold hairlines, tone-on-tone shu-deep ghost 壱 behind, small labeled rules `STACK` / `ROLE`. Desktop: frame bleeds ~8% past the container's right edge. Mobile: band stays, frame returns inside the container. Rail text color adapts while the band intersects (same active-index trigger).

**4.9 Kaiseki Course Numerals** — rewrite `components/sections/work.tsx` rows
`grid-cols-[auto_1fr_2fr]`: informal numeral 一 二 三 at `clamp(5rem,8vw,8rem)` mincho, paper-3, hanging into the left margin (negative margin, `overflow-x: clip` on section); middle column company/role with role→period joined by a dotted leader; right column highlights. Avorino row gets a rotated (-3°) vermillion 現職 tag (via `<Hanko>` styling, rectangular variant) overlapping its top border. Numerals render inline (small, before company name) on mobile.

**4.10 Hanko Ledger** — new `components/system/hanko.tsx` + `data-animate="hanko"` in `use-reveal.ts`
Reusable seal: ~44px shu rounded-square (radius 6px), Shippori glyph knocked out in paper, rotated -4°, dry-ink edge erosion via a radial-gradient CSS mask. Placements: half-overlapping the left end of each section eyebrow (glyph = section numeral 壱–陸); footer signature seal at 64px (glyph 桜, replaces the current footer 桜 chip); contact submit success state stamps a 送 seal beside the confirmation text. Entrance (new reveal case): `power4.in` scale 1.9→1 + tiny 2px heading jolt + a fading shu bleed ring; instant/static under reduced motion.

**4.11 Hanko & Margin Caption (About asymmetry)** — edit `components/sections/about.tsx`
Grid 50/50 → `5fr/7fr`; portrait pulled up `-mt-10` (desktop) so top edges misalign; a 72px `<Hanko glyph="巧">` overlaps the photo frame's top-right corner; a `vertical-rl` caption rail `大阪城の桜の下` on a 1px gold rule hugs the photo's right edge; the 現在/NOW line becomes a Kohaze-style labeled interrupted rule. Rail + corner seal hidden below md.

## 5. Architecture

New: `components/system/{hanko,ghost-kanji,section-rule}.tsx`, `components/layout/tokonoma-frame.tsx`.
Modified: `globals.css` (grain, states, stroke utility), `layout.tsx` (frame mount), `use-reveal.ts` (hanko case), `nav.tsx`, `footer.tsx`, `cursor.tsx`, `skills.tsx`, `showcases.tsx`, `work.tsx`, `about.tsx`, `page.tsx` (SectionRule seams).
Unchanged: hero + diorama, all five showcase recreations, `ShowcaseFrame`, archive/contact layouts (only GhostKanji + seam added), data files, api.

## 6. Verification

- Gates: `tsc`, `eslint`, `vitest`, `build` green.
- Playwright: full-page desktop (1440) + mobile (414) screenshots; 0 console errors; 0 horizontal overflow (the negative-margin numerals and edge-bleeding kanji/frames are the risk — every bleeding element's section needs `overflow-x: clip`); reduced-motion pass (content never hidden; hanko/rail static); keyboard tab shows shu focus rings; showcase click-throughs still work (rail must not intercept pointer events).
- Visual judgment pass per section against the kitsch line (the budgets in §3 are the guardrails).

## 7. Success Criteria

No section shares its layout rhythm with an adjacent one; the chip cloud and uniform seams are gone; Selected Work reads as a narrated index; every interactive state expresses the theme; all budgets in §3 hold; performance unaffected (all static except the spine triggers + hanko entrances).
