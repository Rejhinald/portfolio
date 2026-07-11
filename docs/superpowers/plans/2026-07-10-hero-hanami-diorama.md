# Hero v2 — Floating Hanami Island Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the petals-only hero backdrop with a quality-tiered, mobile-friendly procedural Three.js "floating hanami island" (low-poly Osaka castle + sakura tree + island + torii/lantern + petals + mist), built by executing the Object Sculptor plugin pipeline.

**Architecture:** Deterministic `create*Model(opts) → THREE.Group` factories in `lib/three/`, composed by `components/three/hanami-diorama.tsx` on a tiered `StagedScene`, mounted in the hero via a `dynamic(ssr:false)` lazy wrapper. Sculpting is done through the plugin's staged, screenshot-gated passes with Claude as the AI-vision reviewer via Playwright.

**Tech Stack:** Next 16 · React 19 · TypeScript · raw three.js 0.184 · GSAP/Lenis (existing) · Vitest/happy-dom · Playwright (visual review) · Python 3.13 (plugin scripts, scratchpad only).

**Full spec:** `docs/superpowers/specs/2026-07-10-hero-hanami-diorama-design.md` — read before starting.

## Global Constraints

- Server/client boundaries as today: Three.js components are `"use client"`; the hero stays a server component rendering a `dynamic(ssr:false)` lazy diorama.
- **Deterministic:** no `Math.random()`/`Date`/`new Date()` at module scope or render — use a seeded PRNG (`mulberry32`) so SSR/hydration stay clean and output is reproducible.
- **Mobile is never blank.** `StagedScene` **tiers down** (does not bail) below 768px; reduced-motion / very-low-end → one-shot static render (no rAF loop).
- **Perf budget:** ≤ ~40k triangles desktop; instance roof tiles / blossoms / petals via `InstancedMesh`; one directional + hemisphere + ambient light; **no realtime shadow maps** (fake radial contact shadow only); `setPixelRatio(Math.min(dpr, cap))`; full geometry/material/renderer disposal + `forceContextLoss()` on unmount.
- **Palette (hanami tokens, exact hex):** sora `#7FA9C9`, washi `#F3EEE6`, sumi `#20242A`, shu `#D9432C`, gold `#C2A05B`, sakura `#E8A0B4` / `#F4CDD6`, sakura-deep `#C97A93`, wakaba `#8FA86B` / `#5C7A4F`, stone `#8C9A97`, bark `#5C4A3A`.
- **Factory contract:** each `create*Model` returns a `THREE.Group`, accepts `(opts: { seed?: number; tier?: Tier; palette?: Palette })`, sets `group.userData.sculptRuntime = { nodes, pivots, sockets }`, is deterministic given a seed, and has no module-scope side effects.
- **Verification per task:** `npx tsc --noEmit` + `npm run build` must pass; `npx vitest run` for tasks with tests; visual tasks reviewed on `npm run dev` at http://localhost:3000 via Playwright (screenshot at the review viewpoint). Commit after each task. Do NOT `git push` (owner controls the deploy).
- **Plugin scripts** run only in the scratchpad clone (`<scratchpad>/object-sculptor`); generated spec JSON + review history are copied into `docs/superpowers/sculpt/` for provenance. Do not add Python to the portfolio repo.

---

## File Structure

```
lib/three/
  prng.ts                 # mulberry32 seeded PRNG + helpers (pure, tested)
  quality.ts              # Tier type + selectTier(env) → QualitySettings (pure, tested)
  palette.ts              # hanami palette object consumed by factories
  create-island.ts        # createIslandModel(opts) → THREE.Group
  create-castle.ts        # createCastleModel(opts) → THREE.Group
  create-sakura-tree.ts   # createSakuraTreeModel(opts) → THREE.Group
  create-set-dressing.ts  # createToriiModel / createLanternModel → THREE.Group
  diorama-petals.ts       # createPetalField(count) → { mesh, update(t) } (adapted from petal-field)
  mist.ts                 # createMist(count) → { mesh, update(t) }
components/three/
  staged-scene.tsx        # MODIFIED: tiering instead of mobile bail + static one-shot
  hanami-diorama.tsx      # composes everything; motion; reduced-motion static
  hanami-diorama-lazy.tsx # dynamic(ssr:false) wrapper
components/sections/
  hero.tsx                # MODIFIED: swap petals → diorama, remove torii SVG, add scrim
docs/superpowers/sculpt/  # ObjectSculptSpec JSON + review history (provenance)
```

---

## Phase 0 — Foundations (pure logic, TDD)

### Task 1: Seeded PRNG

**Files:** Create `lib/three/prng.ts`, `lib/three/prng.test.ts`

**Interfaces:**
- Produces: `mulberry32(seed: number): () => number` (deterministic 0–1); `randRange(rng, min, max): number`; `pick<T>(rng, arr: T[]): T`.

- [ ] **Step 1: Write the failing test** `lib/three/prng.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { mulberry32, randRange } from "@/lib/three/prng";

describe("mulberry32", () => {
  it("is deterministic for a seed", () => {
    const a = mulberry32(42), b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it("differs across seeds and stays in [0,1)", () => {
    const r = mulberry32(1);
    for (let i = 0; i < 100; i++) { const v = r(); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); }
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
  it("randRange maps into [min,max)", () => {
    const r = mulberry32(7);
    for (let i = 0; i < 50; i++) { const v = randRange(r, 5, 9); expect(v).toBeGreaterThanOrEqual(5); expect(v).toBeLessThan(9); }
  });
});
```
- [ ] **Step 2:** `npx vitest run lib/three/prng.test.ts` → FAIL (module missing).
- [ ] **Step 3:** Implement `lib/three/prng.ts`:
```ts
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const randRange = (rng: () => number, min: number, max: number) => min + rng() * (max - min);
export const pick = <T>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];
```
- [ ] **Step 4:** `npx vitest run lib/three/prng.test.ts` → PASS.
- [ ] **Step 5:** Commit `feat(three): seeded PRNG for deterministic procedural generation`.

### Task 2: Quality tiers + palette

**Files:** Create `lib/three/quality.ts`, `lib/three/quality.test.ts`, `lib/three/palette.ts`

**Interfaces:**
- Produces:
  - `type Tier = "full" | "reduced" | "static"`.
  - `type QualitySettings = { tier: Tier; dpr: number; petals: number; blossoms: number; parallax: "pointer" | "gyro" | "none"; animate: boolean }`.
  - `selectTier(env: { width: number; reducedMotion: boolean; finePointer: boolean; deviceMemory?: number; cores?: number }): QualitySettings` (pure).
  - `PALETTE` in `palette.ts` (the hex tokens above as an object).

- [ ] **Step 1: Write the failing test** `lib/three/quality.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { selectTier } from "@/lib/three/quality";

describe("selectTier", () => {
  it("reduced-motion → static, no animation", () => {
    const q = selectTier({ width: 1440, reducedMotion: true, finePointer: true });
    expect(q.tier).toBe("static"); expect(q.animate).toBe(false); expect(q.petals).toBe(0);
  });
  it("desktop fine-pointer → full, pointer parallax", () => {
    const q = selectTier({ width: 1440, reducedMotion: false, finePointer: true });
    expect(q.tier).toBe("full"); expect(q.parallax).toBe("pointer"); expect(q.dpr).toBeLessThanOrEqual(2);
  });
  it("mobile width → reduced, gyro, fewer petals than full", () => {
    const full = selectTier({ width: 1440, reducedMotion: false, finePointer: true });
    const mob = selectTier({ width: 414, reducedMotion: false, finePointer: false });
    expect(mob.tier).toBe("reduced"); expect(mob.parallax).toBe("gyro");
    expect(mob.petals).toBeLessThan(full.petals); expect(mob.dpr).toBeLessThanOrEqual(1.5);
  });
  it("very low-end → static", () => {
    const q = selectTier({ width: 1440, reducedMotion: false, finePointer: true, deviceMemory: 2, cores: 2 });
    expect(q.tier).toBe("static");
  });
});
```
- [ ] **Step 2:** `npx vitest run lib/three/quality.test.ts` → FAIL.
- [ ] **Step 3:** Implement `lib/three/quality.ts` (reduced-motion → static; low `deviceMemory≤3`/`cores≤2` → static; width<1024 or coarse pointer → reduced; else full). `petals`: full 320 / reduced 120 / static 0; `blossoms`: full 420 / reduced 200 / static 260 (static shows a rich frame but no loop); `dpr`: full min(devicePixelRatio,2) — but keep pure by passing a cap: full cap 2, reduced cap 1.5, static cap 2; `parallax`: full "pointer", reduced "gyro", static "none"; `animate`: tier!=="static". And `lib/three/palette.ts` exporting `PALETTE`.
- [ ] **Step 4:** `npx vitest run lib/three/quality.test.ts` → PASS.
- [ ] **Step 5:** Commit `feat(three): quality tiers + hanami palette`.

### Task 3: StagedScene tiering (modify)

**Files:** Modify `components/three/staged-scene.tsx`

**Interfaces:**
- Produces: `StagedScene` now (a) never bails purely on width — it renders on mobile at a reduced DPR; (b) still bails to nothing ONLY when the caller's `init` returns `{ animate: false }` AND performs a single render (static tier); (c) passes `{ scene, camera, renderer, width, height }` to `init` as today; (d) `init` may return either an `onFrame(elapsed)` function (animated) or `{ render: "once" }` (static one-shot) or void. Keeps DPR cap (caller sets via `renderer.setPixelRatio`), IntersectionObserver rAF gating, ResizeObserver, and full disposal.

- [ ] **Step 1:** Read current `components/three/staged-scene.tsx`. Change the mount guard from `if (reduce || window.innerWidth < 768) return;` to: compute nothing about width here (the caller decides tier); only keep a hard bail if WebGL is unavailable. Support the return contract: if `init` returns a function → animate via rAF (IO-gated) as today; if it returns `{ render: "once" }` → render a single frame after a `requestAnimationFrame` and do NOT start a loop; if void → single render.
- [ ] **Step 2:** Keep `setPixelRatio` but let the caller override by reading a `dpr` off a new optional prop `dpr?: number` (default `Math.min(devicePixelRatio, 2)`).
- [ ] **Step 3:** `npx tsc --noEmit` → OK. Temporarily wire the existing `PetalField` (still returns an onFrame) through and confirm it still renders on desktop AND now on a 414px viewport via Playwright (screenshot). Then revert any temp wiring.
- [ ] **Step 4:** `npm run build` → OK. Commit `feat(three): StagedScene tiers down on mobile + supports static one-shot render`.

---

## Phase 1 — Sculpt the objects (Object Sculptor pipeline + screenshot review)

> **Process for every object task:** work in `<scratchpad>/object-sculptor`. (1) `python scripts/probe_reference_image.py <ref>`; (2) `python scripts/new_pre_spec_assessment.py "<Name>" --image <ref> --complexity <tier> --out <name>.assessment.json`; (3) `python scripts/new_sculpt_spec.py "<Name>" --image <ref> --assessment <name>.assessment.json --out <name>.spec.json` and hand-edit the component tree / materials / feature targets to the blueprint below; (4) `python scripts/validate_sculpt_spec.py <name>.spec.json` then `--strict-quality`; (5) implement the factory in `lib/three/<file>.ts` following the blueprint, then run the **locked passes** — after each pass render via the harness page (Task 8's dev route or a temp mount) and Playwright-screenshot the review viewpoint, act as the AI-vision reviewer scoring silhouette/structure/form/material/lighting, and `python scripts/append_sculpt_review.py <name>.spec.json --pass-id <pass> --action <continue|refine-code|refine-spec> ...`. Copy final `<name>.spec.json` + review history into `docs/superpowers/sculpt/`. A pass is "done" only when its AI-vision score ≥ 0.75 and no critical feature is below 0.7. **Do not pre-write final mesh code blind — sculpt it against screenshots.** The blueprints below are the starting geometry recipe, not the finished code.

### Task 4: Castle factory (`complex`)

**Files:** Create `lib/three/create-castle.ts`; provenance `docs/superpowers/sculpt/castle.spec.json`. Reference image: `public/portrait/hanami.jpg`.

**Interfaces:**
- Produces: `createCastleModel(opts?: { seed?: number; tier?: Tier }): THREE.Group` with `userData.sculptRuntime`. Height ~ 3 units, centered on its base; root pivot at base center; each tier a child `Group`.

**Geometry blueprint (primitives):**
- **Base:** tapered box / extruded stone platform (`BoxGeometry` scaled, slight top taper), material stone `#8C9A97` matte, beveled top lip.
- **Keep:** 3 stacked tiers; each tier a `BoxGeometry` (white wall `#F3EEE6`, low roughness) narrower + shorter as they rise; thin dark window insets as an `InstancedMesh` of small dark boxes across each wall face.
- **Roofs (per tier):** irimoya-style hip roof — a 4-sided low pyramid (`ConeGeometry(r, h, 4)` rotated 45°, flattened) in sumi `#20242A`, with **upturned eaves** (a thin flared lip: an extruded ring / scaled torus at the base) and a **gold ridge cap** (thin box or `CylinderGeometry` along the ridge, gold `#C2A05B`).
- **Top roof:** taller; add a **gold finial** (small cylinder + sphere) and **shachihoko hints** (tiny gold ornaments at the top-eave corners, instanced).
- **Action-ready:** root Group pivot at base; sockets at each tier center; `userData.sculptRuntime.nodes` maps `base`, `tier0..2`, `roof0..2`, `finial`.
- **Instancing:** windows + ridge caps + shachihoko via `InstancedMesh`. Deterministic (seeded) minor wall-panel variation.

- [ ] **Step 1:** Run pipeline steps (1)–(4) for "Osaka Castle" (`--complexity complex`); commit the validated spec into `docs/superpowers/sculpt/castle.spec.json`.
- [ ] **Step 2:** Implement `create-castle.ts` **blockout** pass (base + 3 wall boxes + 3 simple roof cones, correct proportions/silhouette only). Render + Playwright screenshot (3/4 view) + review; record `--pass-id blockout`.
- [ ] **Step 3:** **structural** pass — tier hierarchy as child Groups, window insets, ridge lines, sockets; screenshot + review.
- [ ] **Step 4:** **form** pass — eave flare (upturned lips), roof curvature, base bevel, finial; screenshot + review.
- [ ] **Step 5:** **material + lighting** pass — white/charcoal/gold/stone materials with slight roughness variation; verify under the diorama lights (Task 8) or a temp 3-light rig; screenshot + review.
- [ ] **Step 6:** **optimization** pass — merge static wall/roof geometry where safe, instance windows/caps, confirm triangle budget; screenshot + review.
- [ ] **Step 7:** `npx tsc --noEmit && npm run build`. Commit `feat(three): procedural Osaka castle factory (sculpted via pipeline)`.

### Task 5: Sakura tree factory (`moderate`)

**Files:** Create `lib/three/create-sakura-tree.ts`; provenance `docs/superpowers/sculpt/sakura-tree.spec.json`.

**Interfaces:**
- Produces: `createSakuraTreeModel(opts?: { seed?: number; tier?: Tier }): THREE.Group`. Root pivot at trunk base; branch sockets in `userData`.

**Geometry blueprint:**
- **Trunk:** `TubeGeometry` along a gently curved `CatmullRomCurve3`, tapering radius base→top, bark `#5C4A3A` with vertex-color mottling.
- **Branches:** deterministic recursion (2–3 levels): from each parent endpoint spawn 2–3 tapered tubes at seeded angles; store endpoints as sockets.
- **Blossom canopy:** `InstancedMesh` of blossom puffs (low-poly icosahedron OR 2-quad cross-billboard with a canvas-generated 5-petal blossom texture) in sakura pinks `#E8A0B4`/`#F4CDD6`/`#C97A93`; placed at branch tips + upper branches with seeded jitter; count = `tier.blossoms`.
- **Action-ready:** root pivot at base; `nodes` = trunk, branch group, canopy.

- [ ] **Step 1:** Pipeline steps (1)–(4) for "Sakura Tree" (`--complexity moderate`; conditional suitability — stylized). Provenance JSON committed.
- [ ] **Step 2:** blockout (trunk + branch skeleton) → screenshot + review.
- [ ] **Step 3:** structural + form (recursion, taper, canopy placement sockets) → review.
- [ ] **Step 4:** material (bark mottling, blossom instances + canvas texture) → review.
- [ ] **Step 5:** optimization (single canopy InstancedMesh, tier counts) → review.
- [ ] **Step 6:** `npx tsc --noEmit && npm run build`. Commit `feat(three): procedural sakura tree factory`.

### Task 6: Island + set dressing + petals + mist

**Files:** Create `lib/three/create-island.ts`, `lib/three/create-set-dressing.ts`, `lib/three/diorama-petals.ts`, `lib/three/mist.ts`; provenance `docs/superpowers/sculpt/island.spec.json`.

**Interfaces:**
- Produces:
  - `createIslandModel(opts?): THREE.Group` — top disc + rock underside + path.
  - `createToriiModel(opts?): THREE.Group`, `createLanternModel(opts?): THREE.Group`.
  - `createPetalField(count: number): { mesh: THREE.InstancedMesh; update(elapsed: number): void }` (adapt existing `petal-field.tsx` math; volume-scoped to the island).
  - `createMist(count: number): { mesh: THREE.Group; update(elapsed: number): void }` — soft translucent billboards (canvas radial-gradient texture) drifting.

**Blueprints:** Island top = low `CylinderGeometry` with seeded noise-displaced rim, wakaba `#8FA86B` top / stone sides; underside = inverted tapered cone (noise-displaced, stone) narrowing to a point; path = thin extruded darker strip. Torii = 2 vertical `CylinderGeometry` posts + 2 horizontal beams (top beam slightly up-curved), shu `#D9432C`. Lantern = stacked cylinders/boxes stone grey + subtle warm emissive core. Fake contact shadow = a dark radial-gradient plane just under the island.

- [ ] **Step 1:** island — pipeline lite (probe/assess/spec/validate `moderate`), implement, blockout→form→material review screenshots. Commit provenance.
- [ ] **Step 2:** torii + lantern (hand-authored to blueprint; one review screenshot each).
- [ ] **Step 3:** `diorama-petals.ts` adapted from `petal-field.tsx` (reuse the drift/sway math; expose `update`); `mist.ts`.
- [ ] **Step 4:** `npx tsc --noEmit && npm run build`. Commit `feat(three): island, torii, lantern, diorama petals, mist`.

---

## Phase 2 — Compose & integrate

### Task 7: Diorama composition + motion

**Files:** Create `components/three/hanami-diorama.tsx`, `components/three/hanami-diorama-lazy.tsx`

**Interfaces:**
- Consumes: all `create*Model`, `createPetalField`, `createMist`, `selectTier`, `PALETTE`, `mulberry32`, tiered `StagedScene`.
- Produces: `<HanamiDiorama className? />` (client) — composes a root `Group` (island + castle + tree + torii + lantern on top; petals + mist around; fake contact shadow), lights (hemisphere sora/wakaba + one warm directional key + ambient), a framing camera; applies motion per tier; and `HanamiDioramaLazy` = `dynamic(() => …, { ssr:false })`.

- [ ] **Step 1:** Build `hanami-diorama.tsx`: on mount read `selectTier({ width, reducedMotion, finePointer, deviceMemory, cores })`; set `renderer` DPR from tier; assemble the scene graph (castle+tree+dressing parented to the island top; petals+mist as siblings; contact-shadow plane). Camera framed upper-center; add a soft depth fog in sora.
- [ ] **Step 2:** Motion in the `init` return: if `tier.animate` → `onFrame(t)` rotates the island root (slow Y), applies sine bob, updates petals/mist, and eases a parallax offset (pointer on desktop, `deviceorientation` on mobile — attempt `requestPermission` silently, no-op if denied); if `!tier.animate` → return `{ render: "once" }` (static frame).
- [ ] **Step 3:** Scroll pull: subscribe to the hero section's scroll progress (reuse `createStickyProgress` or a simple scroll listener) to ease a small camera dolly as the hero exits; guard for static tier.
- [ ] **Step 4:** Verify: temp-mount `<HanamiDiorama>` full-screen in `app/page.tsx`; `npm run dev`; Playwright screenshot desktop (1440) + mobile (414) + reduced-motion (emulate) — confirm scene renders in all three, static frame under reduced-motion, no console errors. Revert temp mount.
- [ ] **Step 5:** `npx tsc --noEmit && npm run build && npx vitest run`. Commit `feat(three): hanami diorama composition + tiered motion`.

### Task 8: Hero integration

**Files:** Modify `components/sections/hero.tsx`

**Interfaces:**
- Consumes: `HanamiDioramaLazy`.
- Produces: hero with the diorama backdrop; keeps sky gradient (behind), name lockup, CTAs, scroll indicator; removes the torii SVG corner mark; adds a bottom-left `--wa-paper` scrim gradient behind the lockup for legibility.

- [ ] **Step 1:** In `hero.tsx`: replace `<PetalFieldLazy … />` with `<HanamiDioramaLazy className="absolute inset-0" />`; delete the torii `<svg>` block; add a `pointer-events-none absolute inset-x-0 bottom-0 h-2/3` gradient `linear-gradient(to top, var(--wa-paper) 0%, transparent 70%)` behind the lockup (below the diorama? — place it z-between diorama and lockup so text is legible but the scene shows above).
- [ ] **Step 2:** `npm run dev`; Playwright screenshot the hero desktop + mobile; confirm the island+castle+tree read clearly, petals drift, the name lockup is legible over the scrim, scroll indicator visible, no overflow.
- [ ] **Step 3:** `npx tsc --noEmit && npm run build`. Commit `feat(hero): mount floating hanami diorama, retire torii SVG, add legibility scrim`.

### Task 9: Mobile/perf pass + final verification + cleanup

**Files:** Modify as needed; remove superseded `components/three/petal-field*.tsx` if fully replaced.

- [ ] **Step 1:** Perf: confirm instancing (windows/blossoms/petals/ridge caps) keeps draw calls low; check the scene disposes cleanly on unmount (no WebGL context-lost warnings) by navigating away/back in Playwright; verify DPR caps per tier.
- [ ] **Step 2:** Reduced-motion + gyro audit (Playwright `reducedMotion: "reduce"` → static frame, no rAF; confirm no errors when `deviceorientation`/permission absent).
- [ ] **Step 3:** If `petal-field.tsx`/`petal-field-lazy.tsx`/`staged-scene`'s old assumptions are fully superseded, remove dead code; keep `staged-scene.tsx` (now tiered).
- [ ] **Step 4:** Full gate: `npx tsc --noEmit && npm run lint && npx vitest run && npm run build`. Playwright: full hero desktop (1440) + mobile (414); confirm no console errors, **no horizontal overflow** either width, static frame under reduced-motion.
- [ ] **Step 5:** Commit `perf(hero): diorama tiering, disposal, reduced-motion + cleanup`. STOP and report; ask the owner before `git push` (push auto-deploys).

---

## Self-Review (against spec)

- **Spec coverage:** §3 scene (Tasks 4–6), §4 motion (Task 7), §5 mobile tiers (Tasks 2,3,7,9), §6 pipeline (process box + Tasks 4–6), §7 architecture/integration (Tasks 7,8), §8 testing (Tasks 1,2,9 + per-task visual), §10 success criteria (Task 9). Covered.
- **No-placeholder note:** the sculpting tasks intentionally give the geometry blueprint + pipeline commands + per-pass acceptance rather than final mesh code — procedural sculpting is a screenshot-driven loop (the plugin's premise); pre-writing final meshes blind would be guesswork. Pure-logic tasks (1,2) carry full TDD code.
- **Type consistency:** `Tier`, `QualitySettings`, `selectTier`, `PALETTE`, `mulberry32`/`randRange`/`pick`, `create*Model(opts) → THREE.Group`, `createPetalField(count) → {mesh,update}`, `createMist(count) → {mesh,update}`, `StagedScene` init-return contract are named identically across producing/consuming tasks.
- **Mobile guarantee:** Task 3 removes the width bail; Task 2 tiers; Task 7 renders static frame under reduced-motion — never blank. Verified in Task 9.
```
