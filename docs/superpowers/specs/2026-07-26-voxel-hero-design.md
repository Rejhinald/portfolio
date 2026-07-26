# Hero v3 — Voxel Hanami Island (Minecraft-authentic)

**Date:** 2026-07-26 · **Repo:** `portfolio` · Replaces the low-poly diorama geometry from `2026-07-10-hero-hanami-diorama-design.md`.

## 1. Vision

Re-art-direct the hero's floating island from smooth low-poly into **authentic Minecraft voxel art**: real cubes on a uniform grid, 16×16 nearest-filtered pixel textures, and Minecraft's own baked shading — rendered in the site's hanami palette. It must not read flat, and it must still run on phones.

Locked decisions: **full voxel rebuild** (island, castle, tree all become blocks) · **hanami-tinted** Minecraft palette (not true-game greens) · shader treatment decided by research (§3).

## 2. Research basis (three briefs, sources in-brief)

Load-bearing findings that this design encodes:

- **Vanilla per-face shade is a compile-time constant table**, not lighting: `UP 1.0`, `DOWN 0.5`, `N/S (±Z) 0.8`, `E/W (±X) 0.6`. Verified in decompiled `BlockModelRenderer.EnumNeighborInfo` and current Sodium `AoNeighborInfo`. Sun position has **zero** effect on block shading — this is vanilla's biggest visual signature.
- **Vanilla "Smooth Lighting" is exactly the 0fps AO lookup, remapped.** `ao = (side1 && side2) ? 0 : 3 - (side1+side2+corner)`, then `shade = 0.4 + 0.2*ao` → the only four values vanilla ever produces: `[0.4, 0.6, 0.8, 1.0]`.
- **Vanilla bakes `tint × faceShade × AO` into a per-vertex colour on the CPU** and does no fragment lighting at all: `color = texture(atlas, uv) * vColor`, then linear fog.
- **Quad-diagonal anisotropy** (0fps): if `a00+a11 > a01+a10`, flip the triangulation or overhangs get diagonal streak artifacts. Vanilla itself has this bug (MC-138211); Sodium fixes it. We fix it.
- **Merged, face-culled geometry beats `InstancedMesh`** decisively: instancing physically cannot cull interior faces (the instance *is* the cube) and cannot do corner AO (`instanceColor` is one flat colour per block). Merged: ~1 draw call, ~30–50% of faces emitted.
- **Material arrays are a trap**: they work on `InstancedMesh` but cost one draw call *per group* (6 faces × N types = dozens) and have driver-corruption history. Use one atlas + baked UVs.
- **Atlas correctness**: `magFilter/minFilter = Nearest`, `generateMipmaps = false`, `colorSpace = SRGBColorSpace` (omitting this is the #1 r152+ washed-out bug), **half-texel inset in atlas space** (`0.5/atlasSize`) against bleeding.
- **Static shadow maps are free**: sun is fixed, geometry is static → `shadowMap.autoUpdate = false` + one `needsUpdate` ⇒ zero cost after frame 1. `BasicShadowMap` (hard edges) is both cheapest and most Minecraft-authentic; `PCFSoft` is explicitly flagged unsuitable for mobile.
- **Waving foliage** (shader-pack, not vanilla): patch `MeshLambertMaterial` at `#include <begin_vertex>` so the displacement propagates into projection, fog, and shadow automatically. Real pack GLSL is 3 octaves, **DC-biased** (leaves *lean* then jitter — centring on zero gives "breathing", the classic mistake). Displacement does not reach the depth pass; we deliberately do **not** add a `customDepthMaterial` (it would force per-frame shadow re-render for wobble nobody sees).
- **Avoid**: bloom, DoF, SSAO (redundant with baked AO), god rays, `RenderPixelatedPass` (Minecraft is hi-res geometry with lo-res *textures*; pixelating the frame fights crisp page type), `MeshStandardMaterial`, ACESFilmic, and any `EffectComposer` (forfeits free MSAA, adds a blit).

## 3. Shading design (the decision)

**Vanilla-exact core, plus a thin shader-pack layer.** Core is what makes it not-flat; the layer is what makes it feel alive in a hero.

| Layer | What | Cost |
|---|---|---|
| Baked `faceShade × AO` in vertex colours | Exact vanilla tables from §2 | 0 (build-time) |
| `MeshLambertMaterial`, ambient-dominant | `HemisphereLight` carries most intensity; one weak `DirectionalLight` mainly to cast the shadow. Face-shade contrast reduced by `SHADE_MIX = 0.7` so Lambert's N·L doesn't double-darken. | ~0 |
| One **static** hard shadow map | `BasicShadowMap`, 1024 desktop / 512 mobile, tight ortho frustum, `normalBias 0.03`, `autoUpdate=false` | 0 after frame 1 |
| Waving foliage | `onBeforeCompile` at `begin_vertex`, `aSway` attribute (0 = rigid, 1 = sways) so trunks stay still; effective rate ~0.2 Hz | ~0 |
| Height haze | Fragment tail blends toward `--wa-paper` low on the island so it dissolves into the page | ~0 |

Deliberately **not** vanilla-pure (`MeshBasic`, no lights, no shadows) because the canopy-on-grass and island self-shadow are the largest remaining depth cues, and hard-edged shadows still read as Minecraft.

## 4. Scale (explicit requirement)

**One uniform block size everywhere: `BLOCK = 0.2` world units.** Island, castle, tree, torii, lantern all use it — differing cube sizes is what breaks voxel art. Models are authored in integer block coordinates and the whole island group is scaled once for framing.

Footprints: island ≈ **26×26** blocks (radius 13) tapering to a spike ≈ 16 deep; castle ≈ **11×11 base, 13 tall**; tree ≈ **9 wide, 11 tall**. 13 blocks × 0.2 = 2.6 units — matching the current island radius, so the existing framing/camera/motion values stay valid.

## 5. Architecture

```
lib/voxel/
  blocks.ts        # BlockId union + per-face atlas tile assignment + flags (solid, foliage, cutout)
  atlas.ts         # procedural 16x16 tile painter -> 256^2 canvas atlas + THREE.Texture
  grid.ts          # VoxelGrid: set/get/fill helpers on a Map<"x,y,z", BlockId>
  mesher.ts        # grid -> merged BufferGeometry (face cull, atlas UV, AO+shade vertex colours, aSway, quad flip)
  material.ts      # patched MeshLambertMaterial (sway + height haze) for opaque and cutout layers
  models/
    island.ts      # terrain: grass cap, dirt, stone spike, path
    castle.ts      # tiered keep: stone base, plaster walls, copper roofs, gold trim
    tree.ts        # sakura: log trunk, branches, pink leaf canopy (cutout + sway)
    dressing.ts    # torii + lantern
components/three/
  voxel-island.ts  # composes models into one grid, meshes it, returns Group (named objects for MCP inspection)
```

`hanami-diorama.tsx` swaps the five `create*Model` calls for one `createVoxelIsland()`; **framing, rotation/bob, pointer/gyro parallax, petals, and mist are unchanged**. Old `lib/three/create-{island,castle,sakura-tree,set-dressing}.ts` are deleted (superseded); `textures.ts` stays only if still referenced, else deleted.

**Interfaces:**
- `BLOCK = 0.2`; `type BlockId = "grass"|"dirt"|"stone"|"cobble"|"log"|"leaves"|"plank"|"plaster"|"roof"|"gold"|"shu"|"lantern"|"path"`
- `buildAtlas(): { texture: THREE.Texture; tiles: Record<BlockId, [number,number][]> }` — 6 tiles per block in `+X,-X,+Y,-Y,+Z,-Z` order
- `class VoxelGrid { set(x,y,z,id); get(x,y,z); isSolid(x,y,z); box(x0,y0,z0,x1,y1,z1,id); disc(cx,cz,y,r,id) }`
- `meshGrid(grid, atlas): { opaque: THREE.BufferGeometry; cutout: THREE.BufferGeometry }`
- `createVoxelIsland(opts?: { seed?: number; tier?: Tier }): THREE.Group`

## 6. Textures (procedural, zero licensing)

16×16 tiles painted on canvas with a seeded PRNG so they're deterministic, in hanami tokens: **grass** wakaba top with dithered noise + dirt-fringe sides (pre-composited, per §2 grass-block note), **dirt** bark-brown speckle, **stone/cobble** grey mottle, **log** bark with ring end-grain, **leaves** sakura-pink with alpha holes (cutout, `alphaTest 0.5`), **plaster** washi, **roof** copper-green with tile lines, **gold**/**shu** accents, **lantern** stone with warm emissive face, **path** stone slab. Hard pixel edges, ≤6 colours per tile.

## 7. Verification

- Assert **`renderer.info.render.calls` ≤ 3** in dev; log triangle count (expect ~20–40k).
- Playwright screenshots: desktop 1440, mobile 414, reduced-motion (static frame), 0 console errors, 0 horizontal overflow.
- Every mesh/group `.name` set (`island-terrain`, `castle`, `sakura-tree`, …) so the Three.js DevTools MCP scene tree is readable next session.
- Unit tests (Vitest, pure functions): `vertexAO` truth table (all 8 side/corner combos + the `side1&&side2` short-circuit), `0.4+0.2*ao` mapping, atlas UV inset math, `VoxelGrid` set/get/isSolid, and mesher face-culling count for a known 2×2×2 solid (expect 24 faces, not 48).
- Gates: `tsc`, `eslint`, `vitest`, `build`.

## 8. Success criteria

Reads unmistakably as Minecraft voxel art in the hanami palette; visible corner AO and per-face brightness (not flat); canopy shadow on the grass; leaves sway subtly; ≤3 draw calls; identical framing/motion to today; phones render it; reduced-motion gets a static frame.
