# Welcome to My Portfolio

### About This Portfolio

A single-page portfolio in a **hanami** (cherry-blossom) design language, built with **Next.js 16**, **React 19**, **Tailwind v4**, GSAP + Lenis, and **raw Three.js**. The hero is a floating voxel island carrying a block-for-block reconstruction of Osaka Castle.

Live: [arwinmiclat-portfolio.vercel.app](https://arwinmiclat-portfolio.vercel.app)

---

## How the voxel hero was built

The brief was mine: make the hero a real Minecraft-style Osaka Castle, not a stylised impression of one. What follows is how that was actually achieved, including the parts that were wrong first.

### 1. Render like Minecraft, not like a game engine

Minecraft's look comes from a few specific, unglamorous rules. Reproducing them mattered more than any lighting trick:

- **Per-face brightness is a constant table**, not lighting: top `1.0`, bottom `0.5`, north/south `0.8`, east/west `0.6`. The sun position has *zero* effect on block shading. This is vanilla's single biggest visual signature.
- **"Smooth lighting" is just ambient occlusion remapped**: `shade = 0.4 + 0.2 * ao`, which yields only four possible values.
- Both are **baked into vertex colours on the CPU**, so the fragment shader does almost nothing.

### 2. One merged mesh, one atlas

- **Merged, face-culled geometry beats `InstancedMesh`.** Instancing physically cannot cull interior faces (the instance *is* the cube) and cannot do per-corner AO. Merging emits ~30–50% of the faces and draws in one call.
- **One texture atlas with baked UVs**, not material arrays — those cost a draw call per group. The atlas needs `NearestFilter`, no mipmaps, `SRGBColorSpace` (omitting it is the classic washed-out bug), and a half-texel inset to stop bleeding.
- The whole island renders in **two draw calls**: opaque and alpha-cutout.
- `MeshLambertMaterial` is patched via `onBeforeCompile` rather than replaced with a `ShaderMaterial`, which keeps three.js's fog, shadow and lighting plumbing intact.
- The sun never moves and the geometry never changes, so the **shadow map is rendered once** and then frozen — free after frame 1.

### 3. Textures come from the real game, at build time

`scripts/build-voxel-atlas.mjs` composes ~69 real block textures into a single 256×256 PNG. Two traps it handles, each of which silently corrupts a naive paste:

- Some textures are **animated vertical strips** (water is 16×512 — thirty-two frames). Only frame 0 may be used.
- Some are **greyscale masks** that Minecraft tints per biome at runtime. Pasted raw they render grey, so the tint is multiplied in at build time.

> Note: the committed atlas contains Mojang artwork. It is here for a personal portfolio; don't reuse it commercially.

### 4. The turning point: transcribe, don't infer

This is the part worth learning from, because the first six passes were wrong.

I had the actual **world save** of the reference build. I used it as a *scorecard* — extracting aggregate statistics (how many rows are wall, how wide is the tower, what's the roof pitch) and then **inventing the actual blocks** from texturing principles. Every measured number said "correct" while the build drifted badly on everything statistics cannot see: the roof section, the overhang profile, and a palette that included a colour the real build does not contain anywhere.

The fix was to stop authoring and start **transcribing**:

1. Read the `.mca` region files directly (Anvil format is just zlib-compressed NBT).
2. Extract the tenshu's **visible shell** — 12,938 blocks of the 30,927 in its bounding box.
3. Map each Minecraft block to an atlas tile, preserving its **slab/stair orientation**.
4. Emit a generated TypeScript module the renderer stamps into the voxel grid.

Three details that each cost a debug cycle:

- **"Touches exterior air" is not a visibility test.** The tower's interior air reaches the outside through every window, so that test dragged all its floors and furniture back in.
- **Axis-visibility alone leaves holes.** A surface seen only on a diagonal — the underside of a flared eave — fails all five camera-axis rays and gets dropped, and you end up seeing through the roof. The kept set needs a one-block dilation.
- **Orientation lives in `Properties`, not `Name`.** A helper that returned only the block name silently defaulted *every* stair to `facing=east, half=bottom`. 798 of 1,871 stairs are actually upside-down — those are the soffits under the eaves.

The result: `castle.ts` went from ~830 lines of generator to ~180 lines of "place a plinth, stamp the shell". Its roofs are the reference's roofs, because they *are* the reference's roofs.

### 5. Measure it, don't squint at it

Aesthetic arguments were replaced with numbers wherever possible:

- `npm run measure:voxel` prints an ASCII cross-section of the castle plus the payload's integrity.
- Invariant tests catch what the eye misses: **no fully detached blocks**, and **no visible vertical air gap** between stacked half-blocks (two bottom slabs stacked leave half a block of air, which reads on screen as a floating cube).
- Every visual change is verified from a **screenshot read at the widths it ships at**, magnified where the detail is small — never from a green typecheck.
- Four gates before every push: `tsc`, `eslint`, `vitest`, `next build`.

Two bugs were caught purely by a number refusing to change: a scene block-count that stayed **byte-identical** across a real density change (the code was returning early and building nothing), and an impossible `corner stairs: 0` on a hipped roof (the block states were never being read). When a number *cannot* have stayed the same, stop tuning and find out why it did.

### 6. Scale

The hero is ~84,000 blocks and ~102,000 faces, built once in ~560 ms behind the preloader, then static. Detail finer than the on-screen block size has to be **exaggerated or omitted** — a vanilla-proportioned hanging lantern is about 5 device pixels here and simply is not there.

---

### Installation

To get this project up and running locally on your machine:

```bash
# Clone

gh repo clone Rejhinald/portfolio

# cd to the folder

cd location/portfolio


# Install node modules

npm i
# or
npm install

# Run Project

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Useful extras:

```bash
npm run test           # vitest — voxel maths + scene invariants
npm run measure:voxel  # ASCII cross-section + build cost of the hero
node scripts/build-voxel-atlas.mjs   # rebuild the block atlas
```

---

### Contact Me

If you'd like to connect, you can reach me at:

- **Email:** arwinmiclat@gmail.com
- **LinkedIn:** [Arwin Miclat](https://linkedin.com/in/arwin-miclat)
- **GitHub:** [Rejhinald](https://github.com/rejhinald)

Thank you for visiting my portfolio!
