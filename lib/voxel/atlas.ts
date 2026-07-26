import * as THREE from "three";
import { mulberry32 } from "@/lib/three/prng";
import { TILE } from "./blocks";

/**
 * Procedural block atlas in the "Bare Bones" idiom.
 *
 * Bare Bones is the flat, trailer-style Minecraft look, and measuring the real
 * pack makes its rules unambiguous: **each tile is 1-3 colours**, the accent
 * covers only 2-20% of the tile, and it is laid out as *structure* (mortar
 * courses, ribs, borders, grain) or as a few short horizontal dashes — never as
 * per-pixel noise. Two consequences we rely on:
 *
 *  1. There is almost no high-frequency detail, so tiles stay readable when a
 *     block is only ~8-12 screen px. That is what lets the diorama carry a much
 *     denser build than a vanilla-textured one could.
 *  2. Surface interest has to come from *light* (see `light.ts`) rather than
 *     from busy albedo — which is also the correct way to texture a build.
 *
 * Colours are the hanami palette pushed toward Bare Bones' flatness/clarity.
 */

/** Tile size in px (Minecraft's native block texture resolution). */
export const TILE_PX = 16;
/** Atlas is an 8x8 grid of tiles. */
export const ATLAS_TILES = 8;
export const ATLAS_PX = TILE_PX * ATLAS_TILES; // 128

/** Half-texel inset in ATLAS space — stops neighbouring tiles bleeding in. */
export const UV_INSET = 0.5 / ATLAS_PX;

type Ctx = CanvasRenderingContext2D;
type RGB = [number, number, number];
type Tile = readonly [number, number];

const px = (ctx: Ctx, t: Tile, x: number, y: number, c: RGB, a = 1) => {
  ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  ctx.fillRect(t[0] * TILE_PX + x, t[1] * TILE_PX + y, 1, 1);
};

const fill = (ctx: Ctx, t: Tile, c: RGB) => {
  ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
  ctx.fillRect(t[0] * TILE_PX, t[1] * TILE_PX, TILE_PX, TILE_PX);
};

// ── pattern primitives, one per Bare Bones layout idiom ────────────────────

/**
 * Sparse short horizontal runs — the organic idiom (grass, dirt, stone).
 * `runs` dashes of 2-5px. Deliberately sparse: real Bare Bones dirt is 6
 * accent pixels out of 256.
 */
function dashes(
  ctx: Ctx,
  t: Tile,
  accent: RGB,
  rng: () => number,
  runs: number,
) {
  for (let i = 0; i < runs; i++) {
    const y = Math.floor(rng() * TILE_PX);
    const len = 2 + Math.floor(rng() * 4);
    const x0 = Math.floor(rng() * (TILE_PX - len));
    for (let x = x0; x < x0 + len; x++) px(ctx, t, x, y, accent);
  }
}

/** Blobby two-tone fill — the one genuinely noisy vanilla tile (cobble). */
function blobs(ctx: Ctx, t: Tile, accent: RGB, rng: () => number, amount = 0.4) {
  const on: boolean[] = [];
  for (let i = 0; i < TILE_PX * TILE_PX; i++) on.push(rng() < amount);
  // One smoothing pass turns salt-and-pepper into clumps.
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      let n = 0;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const nx = (x + dx + TILE_PX) % TILE_PX;
        const ny = (y + dy + TILE_PX) % TILE_PX;
        if (on[ny * TILE_PX + nx]) n++;
      }
      if (n >= 3 || (on[y * TILE_PX + x] && n >= 1))
        px(ctx, t, x, y, accent);
    }
  }
}

/** Offset masonry courses with 1px mortar (stone brick). */
function bricks(ctx: Ctx, t: Tile, mortar: RGB, courseH = 8) {
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const course = Math.floor(y / courseH);
      const onCourseLine = y % courseH === courseH - 1;
      // Vertical joints alternate half a brick per course.
      const joint = (x + (course % 2) * (TILE_PX / 2)) % TILE_PX === TILE_PX - 1;
      if (onCourseLine || joint) px(ctx, t, x, y, mortar);
    }
  }
}

/** 1px border box (gold block). */
function frame(ctx: Ctx, t: Tile, accent: RGB) {
  for (let i = 0; i < TILE_PX; i++) {
    px(ctx, t, i, 0, accent);
    px(ctx, t, i, TILE_PX - 1, accent);
    px(ctx, t, 0, i, accent);
    px(ctx, t, TILE_PX - 1, i, accent);
  }
}

/** Top row + left column only — the quartz/trim idiom. */
function lFrame(ctx: Ctx, t: Tile, accent: RGB) {
  for (let i = 0; i < TILE_PX; i++) {
    px(ctx, t, i, 0, accent);
    px(ctx, t, 0, i, accent);
  }
}

/**
 * Kawara roof tiles: vertical ribs every 4px plus a horizontal course break.
 * Japanese tiled roofs read as ribs first, so the ribs run with the slope.
 */
function kawara(ctx: Ctx, t: Tile, accent: RGB, courseAt = 8) {
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      if (x % 4 === 3) px(ctx, t, x, y, accent);
      else if (y % courseAt === courseAt - 1) px(ctx, t, x, y, accent);
    }
  }
}

/** Regular lattice grid — the dark-prismarine idiom, used for ridge caps. */
function lattice(ctx: Ctx, t: Tile, accent: RGB, step = 4) {
  for (let y = 0; y < TILE_PX; y++)
    for (let x = 0; x < TILE_PX; x++)
      if (x % step === step - 1 || y % step === step - 1)
        px(ctx, t, x, y, accent);
}

/** Vertical 1px grain stripes (logs, beams). */
function vGrain(ctx: Ctx, t: Tile, accent: RGB, rng: () => number) {
  for (let x = 0; x < TILE_PX; x++) {
    if (rng() < 0.45) continue;
    for (let y = 0; y < TILE_PX; y++) if (rng() > 0.25) px(ctx, t, x, y, accent);
  }
}

/** Horizontal board seams every 4 rows plus a few grain ticks. */
function boards(
  ctx: Ctx,
  t: Tile,
  seam: RGB,
  accent: RGB,
  rng: () => number,
) {
  for (let y = 0; y < TILE_PX; y++) {
    const isSeam = y % 4 === 3;
    for (let x = 0; x < TILE_PX; x++) {
      if (isSeam) px(ctx, t, x, y, seam);
      else if (rng() < 0.05) px(ctx, t, x, y, accent);
    }
  }
}

/** Concentric square rings (log end grain). */
function rings(ctx: Ctx, t: Tile, accent: RGB) {
  const c = (TILE_PX - 1) / 2;
  for (let y = 0; y < TILE_PX; y++)
    for (let x = 0; x < TILE_PX; x++) {
      const r = Math.max(Math.abs(x - c), Math.abs(y - c));
      if (Math.round(r) % 3 === 0) px(ctx, t, x, y, accent);
    }
}

/** 2x2 weave, repeating — the wool idiom (decorative band under the eaves). */
function weave(ctx: Ctx, t: Tile, accent: RGB) {
  for (let y = 0; y < TILE_PX; y++)
    for (let x = 0; x < TILE_PX; x++)
      if ((Math.floor(x / 2) + Math.floor(y / 2)) % 2 === 0)
        px(ctx, t, x, y, accent);
}

/**
 * Blossom clusters as plus/cross motifs — how Bare Bones draws cherry leaves.
 * Discrete flower shapes read as blossom at distance where scattered pink
 * pixels just read as a haze.
 */
function blossoms(ctx: Ctx, t: Tile, shades: RGB[], rng: () => number) {
  const [base, light, mid, deep] = shades;
  fill(ctx, t, base);
  // A few transparent bites so the canopy silhouette breaks up against the sky.
  for (let i = 0; i < 5; i++) {
    const hx = Math.floor(rng() * TILE_PX);
    const hy = Math.floor(rng() * TILE_PX);
    ctx.clearRect(t[0] * TILE_PX + hx, t[1] * TILE_PX + hy, 2, 2);
  }
  // Plus-shaped flowers on a loose 5px lattice, jittered.
  for (let cy = 2; cy < TILE_PX; cy += 5) {
    for (let cx = 2; cx < TILE_PX; cx += 5) {
      if (rng() < 0.2) continue;
      const x = cx + (rng() < 0.5 ? 0 : 1);
      const y = cy + (rng() < 0.5 ? 0 : 1);
      const petal = rng() < 0.35 ? mid : light;
      for (const [dx, dy] of [
        [0, -1],
        [-1, 0],
        [1, 0],
        [0, 1],
      ] as const) {
        const ax = x + dx;
        const ay = y + dy;
        if (ax >= 0 && ax < TILE_PX && ay >= 0 && ay < TILE_PX)
          px(ctx, t, ax, ay, petal);
      }
      px(ctx, t, x, y, deep); // stamen
    }
  }
}

// ── palette: hanami hues, Bare Bones flatness ──────────────────────────────
const C = {
  grass: [143, 168, 107] as RGB,
  grassLit: [161, 186, 125] as RGB,
  dirt: [138, 106, 69] as RGB,
  dirtLit: [154, 122, 82] as RGB,
  stone: [138, 146, 144] as RGB,
  stoneLit: [153, 160, 158] as RGB,
  stoneDark: [107, 115, 113] as RGB,
  path: [152, 160, 157] as RGB,
  pathDark: [124, 132, 129] as RGB,
  bark: [70, 47, 56] as RGB,
  barkLit: [87, 64, 74] as RGB,
  plank: [138, 106, 69] as RGB,
  plankSeam: [92, 64, 40] as RGB,
  beam: [67, 48, 28] as RGB,
  beamDark: [51, 35, 15] as RGB,
  plaster: [237, 230, 218] as RGB,
  quartz: [246, 241, 232] as RGB,
  quartzDark: [230, 223, 208] as RGB,
  roof: [111, 168, 149] as RGB,
  roofDark: [71, 119, 106] as RGB,
  ridge: [62, 102, 86] as RGB,
  ridgeDark: [42, 71, 60] as RGB,
  wool: [35, 39, 45] as RGB,
  woolDark: [25, 28, 33] as RGB,
  window: [29, 33, 38] as RGB,
  windowFrame: [46, 52, 59] as RGB,
  gold: [227, 196, 104] as RGB,
  goldDark: [194, 154, 58] as RGB,
  shu: [217, 67, 44] as RGB,
  shuDark: [184, 52, 31] as RGB,
  sakura: [239, 168, 196] as RGB,
  sakuraLight: [247, 203, 221] as RGB,
  sakuraMid: [232, 149, 180] as RGB,
  sakuraDeep: [210, 118, 154] as RGB,
  warm: [255, 214, 150] as RGB,
};

function paintAtlas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const rng = mulberry32(20260726);
  ctx.clearRect(0, 0, ATLAS_PX, ATLAS_PX);

  // ── terrain ──
  fill(ctx, TILE.grassTop, C.grass);
  dashes(ctx, TILE.grassTop, C.grassLit, rng, 5);

  // Grass side: dirt with a shallow ragged green fringe (top 3 rows only).
  fill(ctx, TILE.grassSide, C.dirt);
  dashes(ctx, TILE.grassSide, C.dirtLit, rng, 3);
  for (let x = 0; x < TILE_PX; x++) {
    const depth = 2 + (rng() < 0.4 ? 1 : 0);
    for (let y = 0; y < depth; y++) {
      px(ctx, TILE.grassSide, x, y, rng() < 0.25 ? C.grassLit : C.grass);
    }
  }

  fill(ctx, TILE.dirt, C.dirt);
  dashes(ctx, TILE.dirt, C.dirtLit, rng, 3);

  fill(ctx, TILE.stone, C.stone);
  dashes(ctx, TILE.stone, C.stoneLit, rng, 8);

  fill(ctx, TILE.cobble, C.stone);
  blobs(ctx, TILE.cobble, C.stoneDark, rng, 0.42);

  fill(ctx, TILE.stonebrick, C.stone);
  bricks(ctx, TILE.stonebrick, C.stoneDark, 8);

  fill(ctx, TILE.path, C.path);
  bricks(ctx, TILE.path, C.pathDark, 4);

  // ── wood + foliage ──
  fill(ctx, TILE.logSide, C.bark);
  vGrain(ctx, TILE.logSide, C.barkLit, rng);

  fill(ctx, TILE.logEnd, C.barkLit);
  rings(ctx, TILE.logEnd, C.bark);

  ctx.clearRect(
    TILE.leaves[0] * TILE_PX,
    TILE.leaves[1] * TILE_PX,
    TILE_PX,
    TILE_PX,
  );
  blossoms(
    ctx,
    TILE.leaves,
    [C.sakura, C.sakuraLight, C.sakuraMid, C.sakuraDeep],
    rng,
  );

  fill(ctx, TILE.plank, C.plank);
  boards(ctx, TILE.plank, C.plankSeam, C.plankSeam, rng);

  fill(ctx, TILE.beam, C.beam);
  vGrain(ctx, TILE.beam, C.beamDark, rng);

  // ── castle ──
  // Plaster is deliberately FLAT: Bare Bones' white_concrete is a single colour,
  // and the big white wall masses get all their form from baked light instead.
  fill(ctx, TILE.plaster, C.plaster);

  fill(ctx, TILE.quartz, C.quartz);
  lFrame(ctx, TILE.quartz, C.quartzDark);

  fill(ctx, TILE.roof, C.roof);
  kawara(ctx, TILE.roof, C.roofDark, 8);

  fill(ctx, TILE.roofDark, C.ridge);
  lattice(ctx, TILE.roofDark, C.ridgeDark, 4);

  fill(ctx, TILE.wool, C.wool);
  weave(ctx, TILE.wool, C.woolDark);

  // Window: dark recess with a lit frame, standing in for the guide's
  // iron-trapdoor-over-black-wool window bands.
  fill(ctx, TILE.window, C.window);
  frame(ctx, TILE.window, C.windowFrame);
  for (let y = 3; y < TILE_PX - 3; y++) px(ctx, TILE.window, 7, y, C.windowFrame);

  // ── accents ──
  fill(ctx, TILE.gold, C.gold);
  frame(ctx, TILE.gold, C.goldDark);

  fill(ctx, TILE.shu, C.shu);
  frame(ctx, TILE.shu, C.shuDark);

  fill(ctx, TILE.lanternSide, C.stone);
  dashes(ctx, TILE.lanternSide, C.stoneDark, rng, 4);

  fill(ctx, TILE.lanternLit, C.stone);
  for (let y = 4; y < 12; y++)
    for (let x = 4; x < 12; x++) px(ctx, TILE.lanternLit, x, y, C.warm);
  for (let i = 4; i < 12; i++) {
    px(ctx, TILE.lanternLit, i, 4, C.gold);
    px(ctx, TILE.lanternLit, 4, i, C.gold);
  }
}

/**
 * Build the block atlas as a nearest-filtered three.js texture.
 * NOTE: mipmaps are OFF — three.js would generate them on the *whole* atlas,
 * smearing neighbouring tiles at every level (vanilla MC generates mips per
 * sprite instead). Nearest + no mips is crisp and bleed-proof.
 */
export function buildAtlas(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS_PX;
  canvas.height = ATLAS_PX;
  paintAtlas(canvas);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace; // omitting this = washed-out atlas
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 1;
  tex.needsUpdate = true;
  return tex;
}

/** UV rect for an atlas tile, half-texel inset. Returns [u0,v0,u1,v1]. */
export function tileUV(tx: number, ty: number): [number, number, number, number] {
  const s = 1 / ATLAS_TILES;
  const u0 = tx * s + UV_INSET;
  const u1 = (tx + 1) * s - UV_INSET;
  // Canvas y grows downward; texture v grows upward.
  const v1 = 1 - ty * s - UV_INSET;
  const v0 = 1 - (ty + 1) * s + UV_INSET;
  return [u0, v0, u1, v1];
}
