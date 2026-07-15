# Uniqueness Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the graphic signature system from `docs/superpowers/specs/2026-07-15-uniqueness-pass-design.md` — washi grain, viewport frame, themed states, seam rules, ghost kanji, hanko seals, menu-board skills, kaiseki work numerals, Kanji Spine showcase with vermillion flagship band, About asymmetry.

**Architecture:** Three new system components (`Hanko`, `GhostKanji`, `SectionRule`) + one chrome overlay (`TokonomaFrame`) carry the shared vocabulary; section files consume them. All motion goes through the existing `use-reveal.ts` registry (new `hanko` case) or per-section ScrollTriggers (spine crossfade — no pin). Everything else is static CSS in `globals.css`.

**Tech Stack:** Existing only — React 19 server components where possible, Tailwind v4 utilities + globals.css, GSAP/ScrollTrigger (registered), Lenis, Shippori Mincho/Zen Kaku via CSS vars. No new deps.

## Global Constraints (from spec §3 — binding)

- Numbering: sections 壱弐参肆伍陸 (About 壱, Work 弐, Selected Work 参, Skills 肆, Archive 伍, Contact 陸) rendered only via `<Hanko>` + `<SectionRule>`; Work jobs informal 一 二 三; spine projects giant formal 壱–伍.
- Seal budget: ALL seals render through `<Hanko>`; no cursor stamps.
- Kanji budget: `<GhostKanji>` only on About 私, Skills 技, Archive 蔵, Contact 手紙.
- Band budget: exactly one full-bleed shu band (Selected Work flagship).
- Tilt budget: zero resting tilts.
- Every bleeding element's section gets `overflow-x: clip`; zero horizontal overflow at 1440 and 414.
- Reduced-motion: hanko/spine static, content never hidden. Mobile: frame simplifies, rail collapses to inline headers, columns stack.
- Hero/diorama, showcase recreations, `ShowcaseFrame`, palette, fonts untouched.
- Per task: `npx tsc --noEmit` + visual check on dev server; commit per task; full gate at the end. Push only at the very end (switch gh: `gh auth switch --hostname github.com --user Rejhinald`).

---

## Task 1: Foundation — washi grain + themed states (globals.css, cursor)

**Files:** Modify `app/globals.css`, `components/layout/cursor.tsx`.

- [ ] Add to globals: `body::before` fixed full-viewport layer with two data-URI feTurbulence SVGs (fine: baseFrequency 0.9, opacity .05, multiply; coarse: 0.012, opacity .03), `pointer-events:none; z-index:1`. Footer variant: `.wa-grain-dark::after` overlay 0.08. Content z-indexes unaffected (body children default stack above a z-1 fixed layer only if positioned — set `body::before { z-index: 0 }` and ensure `main/footer` create stacking context via `position: relative`).
- [ ] Add `:focus-visible { outline: 2px solid var(--wa-shu); outline-offset: 2px; }` global; footer-scoped `footer ::selection { background: var(--wa-shu); color: var(--wa-paper); }`.
- [ ] Add `.text-stroke-gold { -webkit-text-stroke: 1px var(--wa-gold); color: transparent; }` utility (+ `paint-order` safe fallback color paper-3 via `@supports not`).
- [ ] Cursor: on `pointerover` of `a, button, [role="button"]`, morph dot → ring (scale 2.2, border 1.5px shu, transparent fill) via class toggle + CSS transition; revert on out.
- [ ] Verify: dev screenshot shows visible-but-subtle grain on paper + footer; tab key shows shu rings; cursor morphs. `tsc` OK. Commit `feat(ui): washi grain, shu focus/selection states, cursor ring-morph`.

## Task 2: Tokonoma Frame + nav/footer states

**Files:** Create `components/layout/tokonoma-frame.tsx`; modify `app/layout.tsx`, `components/layout/nav.tsx`, `components/layout/footer.tsx`.

**Produces:** `<TokonomaFrame />` — fixed, `pointer-events-none`, `aria-hidden`, z-40 (below nav z-50): outer 1.5px sumi border `inset-3` (lg) / `inset-2` (mobile), inner 1px gold hairline `inset-[calc(0.75rem+4px)]` lg-only, bottom-left vertical-rl label `大阪 · OSAKA — 二〇二六` (10px, tracking .3em, ink-mid, on paper chip so it reads over any bg), top-right 6px shu square.

- [ ] Build + mount in layout (after `<Nav/>`).
- [ ] Nav: add shu stamp-dot (4px circle, scale-in transition) before each link, visible on hover AND on active section (IntersectionObserver over `#about #work #selected-work #skills #archive #contact`, rootMargin `-40% 0px -55%`). Client-side, cleanup on unmount.
- [ ] Footer: links get `background-image` dotted gold underline → solid shu on hover (CSS only); footer root gets `wa-grain-dark relative`.
- [ ] Verify: frame visible at 1440 + simplified at 414, no doubled lines vs nav border, label legible, nav dots track scroll. Commit `feat(chrome): tokonoma viewport frame + nav stamp-dots + footer states`.

## Task 3: System components — Hanko, GhostKanji, SectionRule (+ reveal case, Eyebrow seal slot)

**Files:** Create `components/system/hanko.tsx`, `components/system/ghost-kanji.tsx`, `components/system/section-rule.tsx`; modify `lib/animations/use-reveal.ts`, `components/system/eyebrow.tsx`, `app/page.tsx`.

**Produces:**
- `<Hanko glyph size? shape? className?>`: `glyph: string`; `size?: number` (default 44); `shape?: "square" | "tag"` (tag = rectangular 現職 variant); shu rounded-square (r 6px), paper glyph in Shippori, rotate -4deg, dry-edge via CSS `mask-image: radial-gradient(...)`; carries `data-animate="hanko"`.
- `use-reveal.ts` new case `hanko`: `gsap.set(el,{scale:1.9,opacity:0})` → `to {scale:1,opacity:1,duration:.35,ease:"power4.in"}` + sibling heading jolt `y:2→0 .12s` + one `::after` bleed ring fade (implemented as boxShadow tween shu/40 → transparent). Reduced-motion: attribute stripped (existing behavior renders static).
- `<GhostKanji glyph side="left"|"right" anchor="top"|"bottom">`: absolute, `clamp(14rem,34vw,30rem)`, `.text-stroke-gold`, bleeding 15% off its edge, `data-animate="parallax"`, `aria-hidden`, `select-none`, z-0; parent section needs `relative overflow-x-clip`.
- `<SectionRule numeral>`: full-width flex — 22% 1px rule (rule token) · gap with 6px shu square + small stone numeral · 1px rule to 78% · dotted gold leader to margin. `aria-hidden`. Mobile: gap at 12%, leader hidden.
- `<Eyebrow seal?: string>`: when set, renders `<Hanko glyph={seal} size={40}>` half-overlapping the label's left (absolute -left-5 -top-3).

- [ ] Build all three + reveal case + Eyebrow slot.
- [ ] Mount `<SectionRule numeral="弐">` etc. between sections in `page.tsx` (seams: hero→about none; about→work 弐, work→showcases 参, showcases→skills 肆, skills→archive 伍, archive→contact 陸). Pass `seal` to each section's Eyebrow: About 壱, Work 弐, Selected Work 参, Skills 肆, Archive 伍, Contact 陸.
- [ ] Verify: seals stamp in on scroll (static under reduced-motion), seams render, no overflow. Commit `feat(system): hanko seal, ghost kanji, section rules + eyebrow seals`.

## Task 4: Omakase Menu Board (skills)

**Files:** Rewrite `components/sections/skills.tsx`; modify `lib/data/skills.ts` (add `daily: true` markers: Next.js, React, TypeScript, Tailwind CSS, GSAP, Three.js, Cloudflare Workers, PostgreSQL).

- [ ] Data: convert groups to `{ label: "表"|"裏"|"台", en: string, items: { name, daily? }[] }`.
- [ ] Layout: `lg:grid-cols-[5fr_4fr_3fr]` (mobile stack), each column `border-l border-gold/60 pl-6 relative` with `vertical-rl` kanji group label absolutely on the rule; rows = `flex baseline gap-2`: name · `flex-1 border-b border-dotted border-gold/70 translate-y-[-4px]` · dot (`●` shu filled / `○` stone outline via spans). Legend line under heading. `data-animate="fade-up-stagger"` per column. GhostKanji 技 (left, bottom).
- [ ] Verify: screenshot desktop + 414. Commit `feat(skills): omakase menu board with dotted leaders`.

## Task 5: Kaiseki Course Numerals (work)

**Files:** Rewrite rows in `components/sections/work.tsx`.

- [ ] Section: `relative overflow-x-clip`. Rows: `lg:grid-cols-[auto_1fr_2fr]`; numeral `一/二/三` `clamp(5rem,8vw,8rem)` mincho paper-3 `lg:-ml-10` hanging; middle: company (card-title mincho) + role, role→period dotted leader; right: highlights (existing bullets). Avorino row: `<Hanko glyph="現職" shape="tag">` rotated -3deg absolutely overlapping its top border. Mobile: numeral inline-block small before company.
- [ ] Verify: screenshots; margin numerals don't overflow (clip works). Commit `feat(work): kaiseki course numerals + 現職 stamp`.

## Task 6: Kanji Spine + Shu Band (showcases)

**Files:** Rewrite `components/sections/showcases.tsx` (frames/recreations untouched); small client subcomponent `components/showcases/spine-rail.tsx`.

**Produces:** `<SpineRail projects active>` — giant numeral (壱弐参肆伍) `clamp(8rem,14vw,13rem)` `.text-stroke-gold` paper-3, name, dotted-leader meta rows (role·year, stack), 5-notch vertical hairline (active = shu). Client component receiving active index.

- [ ] Wrapper (client): `lg:grid-cols-[4fr_8fr] gap-12`; left `sticky top-24 h-fit` rail; right = existing mapped frames. One ScrollTrigger per frame (`start "top 60%", end "bottom 60%"`, `onToggle` sets active) inside `gsap.context`; rail swap = 0.35s opacity/y crossfade tween on an inner wrapper keyed by active. Reduced-motion/mobile (`lg:hidden` rail): per-frame inline header `numeral · name · role · year` above each frame; no triggers wired when rail hidden or reduced-motion.
- [ ] Shu Band: frame #1 (Avorino)'s row wrapped in full-bleed band `bg-shu` via `mx-[calc(50%-50vw)] px-[calc(50vw-50%)] py-24 lg:py-40`, caption/meta text paper, gold hairlines, ghost 壱 in shu-deep behind, `STACK`/`ROLE` labeled mini-rules; frame `lg:translate-x-[4%] lg:w-[104%]` bleed. Rail stays legible (band starts after rail column visually — verify; if rail overlaps band, tint rail text paper while active===0 using the same trigger).
- [ ] Keep click-throughs working (rail `pointer-events-none` except nothing interactive on it anyway — it contains no links).
- [ ] Verify: scroll-through screenshots (rail crossfades 壱→伍), band renders full-bleed, mobile stack unchanged + inline headers, no overflow, no pin jank. Commit `feat(showcases): kanji spine rail + vermillion flagship band`.

## Task 7: About asymmetry + remaining mounts + footer/contact seals

**Files:** Modify `components/sections/about.tsx`, `components/sections/archive.tsx`, `components/sections/contact.tsx`, `components/layout/footer.tsx`.

- [ ] About: grid → `lg:grid-cols-[5fr_7fr]`, portrait `lg:-mt-10`; `<Hanko glyph="巧" size={72}>` overlapping photo frame top-right (hidden below md); vertical-rl caption `大阪城の桜の下` on 1px gold rule along photo's right (hidden below md); 現在/NOW → labeled interrupted rule (reuse SectionRule styles inline, label 現在); GhostKanji 私 (right, top).
- [ ] Archive: GhostKanji 蔵 (right, bottom, solid paper-3 variant — add `variant="solid"` prop). Contact: GhostKanji 手紙 (left, top); submit success state renders `<Hanko glyph="送" size={56}>` beside the confirmation text.
- [ ] Footer: replace the 桜 chip with `<Hanko glyph="桜" size={64}>` (no reveal animation in footer — mounted visible; pass `animate={false}` prop to skip data-animate).
- [ ] Verify: screenshots. Commit `feat(sections): about asymmetry, ghost kanji mounts, footer/contact seals`.

## Task 8: Full verification + tuning + review + ship

- [ ] Gate: `npx tsc --noEmit && npx eslint . && npx vitest run && npm run build` all green.
- [ ] Playwright: full-page desktop 1440 + mobile 414 (0 console errors, 0 horizontal overflow both); reduced-motion pass (canvas static, seals/rail static, nothing hidden); keyboard tab → shu rings; all five showcase links still resolve.
- [ ] Kitsch tuning pass: view every section; check budgets (§3); adjust opacity/scale of ghost kanji + grain if loud.
- [ ] `/code-review` medium over the diff; fix real findings.
- [ ] Commit; `gh auth switch --hostname github.com --user Rejhinald`; `git push origin main`; confirm 0 ahead.

## Self-Review

- Spec coverage: 4.1→T1, 4.2→T2, 4.3→T1+T2, 4.4→T3, 4.5→T3+T4+T7, 4.6→T4, 4.7+4.8→T6, 4.9→T5, 4.10→T3+T7, 4.11→T7; §6 verification→T8. Covered.
- Numbering consistent: sections 壱–陸 (T3 mounts), jobs 一二三 (T5), spine 壱–伍 (T6, distinct giant scale).
- Interfaces consistent: `Hanko(glyph,size,shape,animate?)`, `GhostKanji(glyph,side,anchor,variant?)`, `SectionRule(numeral)`, `Eyebrow(seal?)`, `SpineRail(projects,active)`.
- Visual work is screenshot-iterated per task (same method as the diorama build); code blocks omitted where pixel values will be tuned live — concrete values specified where they're structural.
