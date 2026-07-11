# Hero v2 — Floating Hanami Island (procedural Three.js diorama)

**Date:** 2026-07-10
**Owner:** Arwin Gerard Miclat
**Repo:** `portfolio` (Vercel, auto-deploys on push to `main`; `gh` authed as Rejhinald)

## 1. Vision

Replace the current petals-only hero backdrop with a **stylized low-poly floating island** drifting in the hanami sky, carrying a **low-poly Osaka castle** and a **procedural sakura tree**, with drifting petals and soft mist. Gentle turntable rotation + parallax. The existing bottom-left name/CTA lockup and scroll indicator stay, over a soft paper scrim for legibility. It must look intentional and run well **on mobile** (quality-tiered, never blank).

The 3D is built by **executing the Three.js Object Sculptor Codex plugin's actual pipeline** (its Python helper scripts + staged, screenshot-gated build passes), adapted to run here with Claude as the AI-vision reviewer via Playwright.

## 2. Goals & Non-Goals

**Goals**
- A cohesive, on-brand floating-island diorama (castle + sakura tree + island + torii/lantern + petals + mist).
- Runs on **mobile with quality tiers** (not the current "bail to nothing" below 768px); static single-frame fallback for reduced-motion / very-low-end.
- Motion: slow auto-rotation + float, mouse parallax (desktop) / device-tilt (mobile), petals drift, slight scroll camera pull.
- Built via the plugin's pipeline (probe → pre-spec assessment → `ObjectSculptSpec` → validate → generate factory → locked build passes with screenshot/AI-vision review).
- Clean integration: keep the hero lockup/CTAs/scroll indicator; retire the torii SVG corner mark; fold petals into the diorama.
- Deterministic (seeded) procedural generation — no `Math.random`/`Date` at render; SSR/hydration clean; full GL disposal on unmount.

**Non-Goals (YAGNI)**
- No GLTF/external 3D models; no photoreal PBR; no realtime shadow maps on mobile.
- No physics/destruction wiring (models are *action-ready* per the pipeline, but interactions are not built now).
- No change to any other section of the site.

## 3. Scene Composition

**Layout:** the floating island sits in the upper-center of the hero stage; the castle + tree are the focal cluster on the island top; drifting petals fill the volume; wispy clouds/mist drift beneath the island. The **bottom-left** keeps the editorial lockup over a soft `--wa-paper` scrim gradient so text stays legible. Scroll indicator bottom-center.

**Elements:**
- **Osaka castle** (focal build, "complex"): stone base → white-walled tiered keep (3–5 tiers) → **charcoal curved (irimoya) roofs** with upturned eaves → **gold ridge caps / shachihoko hints** → small windows. Reference: `public/portrait/hanami.jpg`.
- **Sakura tree** ("moderate"): curved trunk (curve/tube geometry) → deterministic branching (2–3 recursion levels) → **instanced blossom clusters** (low-poly or cross-billboard blossoms, hundreds via `InstancedMesh`).
- **Island** ("moderate"): rounded low-poly rock underside (tapered, noise-displaced), mossy/matcha-green top with a stone path; slow **bob + Y-rotation**.
- **Set dressing:** a small vermillion **torii**, one stone lantern.
- **Petals:** reuse/adapt the existing instanced sakura-petal system, drifting around the island.
- **Mist/clouds:** a few soft translucent billboards beneath the island.

**Palette (hanami tokens):** sora sky `#7FA9C9`, washi `#F3EEE6`; sumi roofs `#20242A`; shu vermillion `#D9432C` (torii/accents); sakura pink `#E8A0B4`/`#F4CDD6` (blossoms/petals); wakaba green `#8FA86B` (grass/moss); kin gold `#C2A05B` (ridge caps); stone greys for base/lantern.

## 4. Motion & Interaction

- **Ambient:** slow island Y-rotation (~1 rev / 40–60s) + gentle vertical bob (sine); petals drift + sway; subtle blossom shimmer.
- **Parallax:** desktop → camera/scene offset follows pointer (eased); mobile → `deviceorientation` (gyro) tilt, gated behind permission where required (graceful no-op if denied/unavailable).
- **Scroll:** slight camera dolly/tilt as the hero scrolls out (via the section's scroll progress; no GSAP pin).
- **Reduced-motion:** render exactly one frame (no rAF loop, no rotation, no petals), so the diorama still shows with zero ongoing cost.

## 5. Mobile / Performance Strategy

The one existing-code change: **`StagedScene` tiers down instead of bailing below 768px.**

| Tier | Trigger | Settings |
|---|---|---|
| Full | desktop, ≥1024px, fine pointer | DPR≤2, all blossom/petal instances, fake soft contact shadow, pointer parallax |
| Reduced | mobile / ≤1024px | DPR≤1.5, ~40–50% blossom/petal instances, simplified materials, blob contact shadow, gyro parallax |
| Static | reduced-motion or very-low-end (e.g., `deviceMemory`≤4 / low `hardwareConcurrency`) | one-frame render, no loop |

- **Budget:** ≤ ~40k triangles desktop; aggressive `InstancedMesh` for roof tiles, blossoms, petals; minimal draw calls; one directional + hemisphere + ambient light; **no realtime shadow maps** (baked/fake contact shadow only); DPR cap; full geometry/material/renderer disposal + `forceContextLoss()` on unmount (as today).
- IntersectionObserver-gated rAF (pause when hero off-screen), as today.

## 6. Build Method — the Object Sculptor pipeline

Cloned at `<scratchpad>/object-sculptor` (Python 3.13 verified). Per object (castle first, then tree; island/torii/lantern are simpler hand-authored or light-spec):

1. `python scripts/probe_reference_image.py <ref>` — technical check.
2. `python scripts/new_pre_spec_assessment.py "<Object>" --image <ref> --complexity <tier> --out assessment.json` — quality contract.
3. `python scripts/new_sculpt_spec.py "<Object>" --image <ref> --assessment assessment.json --out spec.json` — author the `ObjectSculptSpec` (component tree, materials, action-ready pivots, repetition systems, review viewpoints). Replace generic starter feature targets with real identity-defining systems (roof tiers, ridge caps, wall panels; trunk, branch system, blossom canopy).
4. `python scripts/validate_sculpt_spec.py spec.json` then `--strict-quality` — gate before code.
5. `python scripts/generate_threejs_factory.py spec.json --out <factory>.ts` — **pass-gated** skeleton (blockout only first); deeper passes only after prior pass reviewed `continue`.
6. **Locked build passes** blockout → structural → form → material → lighting → optimization. After each pass: render in browser (Playwright), screenshot at the review viewpoint, build a comparison sheet (`make_visual_comparison_sheet.py`), **Claude reviews the screenshot as the AI-vision gate** scoring silhouette/structure/form/material/lighting, record with `append_sculpt_review.py`, then `sculpt_pass_orchestrator.py` to unlock the next pass.

The refined factory functions are committed into the portfolio as clean TypeScript (see §7). Spec JSON + review history live under `docs/superpowers/sculpt/` for provenance.

## 7. Architecture & Integration

**New files:**
```
lib/three/
  create-island.ts        # createIslandModel(opts) → THREE.Group (action-ready)
  create-castle.ts        # createCastleModel(opts) → THREE.Group
  create-sakura-tree.ts   # createSakuraTreeModel(opts) → THREE.Group
  create-set-dressing.ts  # torii + lantern
  diorama-petals.ts       # instanced petal field (adapted from existing petal-field)
  quality.ts              # tier detection → { dpr, blossoms, petals, shadow, parallax }
components/three/
  hanami-diorama.tsx      # composes island+castle+tree+dressing+petals on a StagedScene
  hanami-diorama-lazy.tsx # dynamic(ssr:false) wrapper
docs/superpowers/sculpt/  # ObjectSculptSpec JSON + review history (provenance)
```

**Modified:**
- `components/three/staged-scene.tsx` — replace the hard mobile bail with a **tier** (accept an `onFrame` + allow a one-shot static render; expose viewport/tier to `init`). Keep DPR cap, IO gating, disposal.
- `components/sections/hero.tsx` — swap `PetalFieldLazy` → `HanamiDioramaLazy`; remove the torii SVG; keep the sky gradient (behind the scene), lockup, CTAs, scroll indicator; add the paper scrim behind the lockup.
- `components/three/petal-field*.tsx` — kept for reference or folded into `diorama-petals.ts` (remove if fully superseded).

**Factory contract (each `create*Model`):** returns a `THREE.Group` with `userData.sculptRuntime` (nodes, pivots, sockets) per the pipeline; accepts an options object (`{ seed, tier, palette }`); deterministic given a seed; no side effects on module scope.

## 8. Testing & Verification

- Unit (Vitest): `quality.ts` tier selection (pure), petal/blossom count helpers, deterministic seed → stable output (snapshot a few generated transforms).
- Build gates: `tsc`, `eslint`, `vitest`, `next build` all pass.
- Visual (Playwright, part of the pipeline + final): screenshot the hero on desktop (1440) and mobile (414) after preloader; confirm the diorama renders, no console errors, no horizontal overflow, reduced-motion shows a static frame, and the name lockup stays legible.
- Perf sanity: confirm instancing keeps draw calls/triangles within budget; the scene disposes cleanly on unmount (no WebGL context warnings).

## 9. Open Items to Confirm During Review

1. **Motion defaults** (auto-rotate + parallax, gyro on mobile) — accept or adjust speeds/axes.
2. **Gyro permission UX** on iOS (needs a user gesture for `DeviceOrientationEvent.requestPermission`) — default: attempt silently, no-op if not granted; no prompt UI. Confirm acceptable.
3. **Torii SVG corner mark removal** — confirmed removed (replaced by 3D scene).

## 10. Success Criteria

- Hero shows the floating hanami island (castle + sakura tree + petals + island) on desktop **and** mobile, quality-tiered, never blank.
- Reduced-motion renders a clean static frame; no ongoing cost.
- Built via the plugin pipeline with recorded per-pass AI-vision reviews (provenance under `docs/superpowers/sculpt/`).
- `tsc`/`eslint`/`vitest`/`build` green; no console errors; no horizontal overflow desktop + mobile; name lockup legible.
- Deterministic, disposes cleanly, within the perf budget.
