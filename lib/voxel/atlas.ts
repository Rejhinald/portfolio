import * as THREE from "three";
import { mulberry32 } from "@/lib/three/prng";
import { TILE } from "./blocks";

/** Tile size in px (Minecraft's native block texture resolution). */
export const TILE_PX = 16;
/** Atlas is a 4x4 grid of tiles. */
export const ATLAS_TILES = 4;
export const ATLAS_PX = TILE_PX * ATLAS_TILES; // 64

/** Half-texel inset in ATLAS space — stops neighbouring tiles bleeding in. */
export const UV_INSET = 0.5 / ATLAS_PX;

type Ctx = CanvasRenderingContext2D;
type RGB = [number, number, number];

const px = (
  ctx: Ctx,
  tx: number,
  ty: number,
  x: number,
  y: number,
  c: RGB,
  a = 1,
) => {
  ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  ctx.fillRect(tx * TILE_PX + x, ty * TILE_PX + y, 1, 1);
};

const fill = (ctx: Ctx, tx: number, ty: number, c: RGB) => {
  ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
  ctx.fillRect(tx * TILE_PX, ty * TILE_PX, TILE_PX, TILE_PX);
};

const shift = (c: RGB, d: number): RGB => [
  Math.max(0, Math.min(255, c[0] + d)),
  Math.max(0, Math.min(255, c[1] + d)),
  Math.max(0, Math.min(255, c[2] + d)),
];

/**
 * Clustered noise — the core Minecraft texture look.
 *
 * Real MC tiles use CLUSTERED patches, not per-pixel white noise: at typical
 * on-screen block sizes 1px noise degenerates into static, while 2px blobs
 * still read as texture. `step` is the blob size in texels.
 */
function speckle(
  ctx: Ctx,
  tx: number,
  ty: number,
  base: RGB,
  rng: () => number,
  amount = 0.4,
  spread = 20,
  step = 2,
) {
  for (let y = 0; y < TILE_PX; y += step) {
    for (let x = 0; x < TILE_PX; x += step) {
      if (rng() > amount) continue;
      const c = shift(base, Math.round((rng() * 2 - 1) * spread));
      for (let dy = 0; dy < step; dy++) {
        for (let dx = 0; dx < step; dx++) {
          // Ragged blob edges: drop the odd texel so patches aren't perfect squares.
          if (rng() < 0.18) continue;
          if (x + dx < TILE_PX && y + dy < TILE_PX)
            px(ctx, tx, ty, x + dx, y + dy, c);
        }
      }
    }
  }
}

// Hanami palette, as RGB triples.
const C = {
  wakaba: [143, 168, 107] as RGB,
  wakabaDeep: [92, 122, 79] as RGB,
  bark: [92, 74, 58] as RGB,
  barkDark: [68, 54, 42] as RGB,
  stone: [124, 134, 132] as RGB,
  stoneDark: [92, 100, 98] as RGB,
  stonePath: [150, 156, 152] as RGB,
  washi: [243, 238, 230] as RGB,
  paper3: [234, 227, 215] as RGB,
  roof: [122, 168, 146] as RGB,
  roofDark: [85, 122, 104] as RGB,
  gold: [194, 160, 91] as RGB,
  goldDeep: [140, 110, 63] as RGB,
  shu: [217, 67, 44] as RGB,
  shuDeep: [168, 51, 32] as RGB,
  sakura: [232, 160, 180] as RGB,
  sakuraLight: [244, 205, 214] as RGB,
  sakuraDeep: [201, 122, 147] as RGB,
  warm: [255, 214, 150] as RGB,
};

function paintAtlas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const rng = mulberry32(20260726);
  ctx.clearRect(0, 0, ATLAS_PX, ATLAS_PX);

  // ── grass top ──
  fill(ctx, ...TILE.grassTop, C.wakaba);
  speckle(ctx, ...TILE.grassTop, C.wakaba, rng, 0.55, 22);

  // ── grass side: dirt with a green fringe baked in (MC grass_block_side) ──
  fill(ctx, ...TILE.grassSide, C.bark);
  speckle(ctx, ...TILE.grassSide, C.bark, rng, 0.5, 18);
  for (let x = 0; x < TILE_PX; x++) {
    const depth = 2 + Math.floor(rng() * 3); // ragged fringe
    for (let y = 0; y < depth; y++) {
      px(ctx, ...TILE.grassSide, x, y, shift(C.wakaba, Math.round((rng() * 2 - 1) * 20)));
    }
  }

  // ── dirt ──
  fill(ctx, ...TILE.dirt, C.bark);
  speckle(ctx, ...TILE.dirt, C.bark, rng, 0.6, 22);

  // ── stone ──
  fill(ctx, ...TILE.stone, C.stone);
  speckle(ctx, ...TILE.stone, C.stone, rng, 0.5, 18);

  // ── cobble: clustered stones with dark mortar ──
  fill(ctx, ...TILE.cobble, C.stoneDark);
  for (let by = 0; by < 4; by++) {
    for (let bx = 0; bx < 4; bx++) {
      const w = 3 + Math.floor(rng() * 2);
      const h = 3 + Math.floor(rng() * 2);
      const tone = shift(C.stone, Math.round((rng() * 2 - 1) * 22));
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
          px(ctx, ...TILE.cobble, bx * 4 + x, by * 4 + y, tone);
    }
  }

  // ── log side: vertical bark grain ──
  fill(ctx, ...TILE.logSide, C.bark);
  for (let x = 0; x < TILE_PX; x++) {
    const d = Math.round((rng() * 2 - 1) * 20);
    for (let y = 0; y < TILE_PX; y++) {
      const g = rng() > 0.82 ? -14 : 0;
      px(ctx, ...TILE.logSide, x, y, shift(C.bark, d + g));
    }
  }

  // ── log end: concentric rings ──
  fill(ctx, ...TILE.logEnd, C.barkDark);
  const cx = 7.5;
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const r = Math.hypot(x - cx, y - cx);
      const ring = Math.floor(r) % 2 === 0;
      px(ctx, ...TILE.logEnd, x, y, ring ? shift(C.bark, 16) : C.bark);
    }
  }

  // ── leaves: sakura canopy with alpha holes (cutout) ──
  ctx.clearRect(TILE.leaves[0] * TILE_PX, TILE.leaves[1] * TILE_PX, TILE_PX, TILE_PX);
  const shades = [C.sakura, C.sakuraLight, C.sakuraDeep];
  // 2x2 blossom clusters with gaps — chunky enough to read at block scale.
  for (let y = 0; y < TILE_PX; y += 2) {
    for (let x = 0; x < TILE_PX; x += 2) {
      if (rng() < 0.1) continue; // hole -> transparent, alphaTest cuts it
      const c = shift(
        shades[Math.floor(rng() * shades.length)],
        Math.round((rng() * 2 - 1) * 10),
      );
      for (let dy = 0; dy < 2; dy++)
        for (let dx = 0; dx < 2; dx++)
          if (rng() > 0.12) px(ctx, ...TILE.leaves, x + dx, y + dy, c);
    }
  }

  // ── plank: horizontal boards ──
  fill(ctx, ...TILE.plank, C.bark);
  for (let y = 0; y < TILE_PX; y++) {
    const board = Math.floor(y / 4);
    const d = 8 - board * 5;
    for (let x = 0; x < TILE_PX; x++) {
      const seam = y % 4 === 3;
      px(ctx, ...TILE.plank, x, y, shift(C.bark, seam ? -20 : d + (rng() > 0.85 ? -8 : 0)));
    }
  }

  // ── plaster: washi wall ──
  fill(ctx, ...TILE.plaster, C.washi);
  speckle(ctx, ...TILE.plaster, C.washi, rng, 0.35, 10);
  for (let x = 0; x < TILE_PX; x++) px(ctx, ...TILE.plaster, x, 15, C.paper3);

  // ── roof: copper-green tiles with ridge lines ──
  fill(ctx, ...TILE.roof, C.roof);
  speckle(ctx, ...TILE.roof, C.roof, rng, 0.35, 14);
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      if (x % 4 === 0) px(ctx, ...TILE.roof, x, y, C.roofDark);
      if (y % 8 === 7) px(ctx, ...TILE.roof, x, y, shift(C.roofDark, -6));
    }
  }

  // ── gold ──
  fill(ctx, ...TILE.gold, C.gold);
  speckle(ctx, ...TILE.gold, C.gold, rng, 0.4, 20);
  for (let i = 0; i < TILE_PX; i++) px(ctx, ...TILE.gold, i, i, shift(C.gold, 26));

  // ── shu (vermillion, for the torii) ──
  fill(ctx, ...TILE.shu, C.shu);
  speckle(ctx, ...TILE.shu, C.shu, rng, 0.3, 16);
  for (let y = 0; y < TILE_PX; y++) px(ctx, ...TILE.shu, 15, y, C.shuDeep);

  // ── lantern side (stone) + lit face ──
  fill(ctx, ...TILE.lanternSide, C.stone);
  speckle(ctx, ...TILE.lanternSide, C.stone, rng, 0.45, 16);
  fill(ctx, ...TILE.lanternLit, C.stone);
  speckle(ctx, ...TILE.lanternLit, C.stone, rng, 0.4, 14);
  for (let y = 4; y < 12; y++)
    for (let x = 4; x < 12; x++)
      px(ctx, ...TILE.lanternLit, x, y, shift(C.warm, Math.round((rng() * 2 - 1) * 10)));

  // ── path: stone slab with mortar edges ──
  fill(ctx, ...TILE.path, C.stonePath);
  speckle(ctx, ...TILE.path, C.stonePath, rng, 0.45, 16);
  for (let i = 0; i < TILE_PX; i++) {
    px(ctx, ...TILE.path, i, 0, C.stoneDark);
    px(ctx, ...TILE.path, 0, i, C.stoneDark);
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
