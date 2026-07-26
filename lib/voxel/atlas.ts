import * as THREE from "three";
import { ATLAS_PX, ATLAS_TILES } from "./atlas-tiles";

/**
 * The block atlas: real Minecraft block textures, composed at build time by
 * `scripts/build-voxel-atlas.mjs` into `public/voxel-atlas.png`.
 *
 * Procedurally painted tiles were tried first and repeatedly read as "not
 * Minecraft" — the authentic look really is in the original art, not in a
 * reimplementation of its rules. The build script handles the three vanilla
 * details that silently corrupt a naive paste (animated strips, greyscale masks
 * that Minecraft tints per biome, and the grass-side overlay); see its header.
 *
 * Tints are baked into the atlas rather than applied per-vertex on purpose: the
 * vertex `color` attribute is already carrying `AO * faceShade * paintedLight`,
 * so reusing it for albedo tint would collide with the baked shading.
 */

export { ATLAS_PX, ATLAS_TILES, TILE_PX, TILE, type TileName } from "./atlas-tiles";

/** Half-texel inset in ATLAS space — stops neighbouring tiles bleeding in. */
export const UV_INSET = 0.5 / ATLAS_PX;

/** Where the generated atlas is served from. */
export const ATLAS_URL = "/voxel-atlas.png";

let cached: THREE.Texture | null = null;

/**
 * Load the atlas as a nearest-filtered texture, shared across every voxel
 * material in the page.
 *
 * NOTE: mipmaps are OFF. three.js would generate them across the *whole* atlas,
 * smearing neighbouring tiles at every level (vanilla generates mips per sprite
 * instead). At dpr 2 the island samples these 16px tiles at roughly 1:1, so
 * there is little minification to filter anyway, and Nearest is both crisper and
 * bleed-proof.
 */
export function loadAtlas(): THREE.Texture {
  if (cached) return cached;

  const tex = new THREE.TextureLoader().load(ATLAS_URL);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace; // omitting this = washed-out atlas
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 1;
  cached = tex;
  return tex;
}

/** Drop the shared atlas (only for teardown in tests / HMR). */
export function disposeAtlas(): void {
  cached?.dispose();
  cached = null;
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

/**
 * UV sub-rect for a partial face, used by sub-cube geometry (stairs, slabs,
 * plants). Minecraft does NOT stretch a texture across a partial face — it
 * crops the texture to the box's extent in that plane, so a stair's step shows
 * the middle of the tile rather than a squashed copy of all of it.
 *
 * `u0f`..`v1f` are fractions in [0,1] of the face's own plane.
 */
export function tileUVSub(
  tx: number,
  ty: number,
  u0f: number,
  v0f: number,
  u1f: number,
  v1f: number,
): [number, number, number, number] {
  const [a0, b0, a1, b1] = tileUV(tx, ty);
  return [
    a0 + (a1 - a0) * u0f,
    b0 + (b1 - b0) * v0f,
    a0 + (a1 - a0) * u1f,
    b0 + (b1 - b0) * v1f,
  ];
}
