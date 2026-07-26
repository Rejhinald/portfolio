import type { VoxelGrid } from "./grid";

/**
 * "Painting light" onto the build.
 *
 * Good Minecraft texturing is not sprinkling similar blocks around — from any
 * distance that averages out to flat mush. What actually reads is *light*:
 * surfaces go dark under overhangs, in corners, beneath window heads and toward
 * the ground, and bright where the sky reaches them. Because this pipeline bakes
 * shading into vertex colours, we can paint that directly instead of faking it
 * with block choice.
 *
 * Two passes, multiplied together into `grid.setShade`:
 *
 *  1. **Skylight** — march upward from each block; anything above it casts a
 *     shadow that falls off with distance. This is what gives the tenshu its
 *     dark band under every flared eave (the eaves overhang ~3 blocks) and the
 *     island its shadowed underside, for free and automatically.
 *  2. **Gravity** — a gentle vertical gradient, darker low down. Cheap, and it
 *     makes the silhouette read as a solid mass rather than a flat sticker.
 */

export type PaintOpts = {
  /** How far up to look for occluders. */
  reach?: number;
  /** Darkest the skylight pass may take a block. */
  minSky?: number;
  /** Y where the gravity gradient bottoms out, and where it stops darkening. */
  yDark: number;
  yLit: number;
  /** Darkest the gravity gradient may take a block. */
  minGravity?: number;
};

export function paintLight(grid: VoxelGrid, opts: PaintOpts): void {
  const reach = opts.reach ?? 6;
  const minSky = opts.minSky ?? 0.58;
  const minGravity = opts.minGravity ?? 0.8;
  const { yDark, yLit } = opts;
  const span = Math.max(1, yLit - yDark);

  // Total weight if every cell overhead were solid, so occlusion normalises to 1.
  let maxWeight = 0;
  for (let d = 1; d <= reach; d++) maxWeight += 1 / d;

  for (const [x, y, z] of grid.entries()) {
    let blocked = 0;
    for (let d = 1; d <= reach; d++) {
      if (grid.isSolid(x, y + d, z)) blocked += 1 / d;
    }
    const sky = 1 - (1 - minSky) * (blocked / maxWeight);

    const t = Math.max(0, Math.min(1, (y - yDark) / span));
    const gravity = minGravity + (1 - minGravity) * t;

    grid.setShade(x, y, z, sky * gravity);
  }
}

/**
 * Smooth 3D value noise in [0,1], used to vary materials in CLUSTERS.
 *
 * Per-block randomness is the classic texturing mistake: it reads as noise up
 * close and as nothing at all from far away. Sampling a smooth field instead
 * makes cobble and brick gather into patches that look like real weathering.
 */
export function clusterNoise(
  x: number,
  y: number,
  z: number,
  scale = 0.18,
  seed = 1337,
): number {
  const sx = x * scale;
  const sy = y * scale;
  const sz = z * scale;
  const x0 = Math.floor(sx);
  const y0 = Math.floor(sy);
  const z0 = Math.floor(sz);
  const fx = sx - x0;
  const fy = sy - y0;
  const fz = sz - z0;
  // Smoothstep so patches have soft edges rather than grid-aligned seams.
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);

  const corner = (i: number, j: number, k: number): number => {
    let h = (i * 374761393 + j * 668265263 + k * 2147483647 + seed * 1274126177) | 0;
    h = (h ^ (h >>> 13)) * 1274126177;
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967295;
  };

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const c00 = lerp(corner(x0, y0, z0), corner(x0 + 1, y0, z0), ux);
  const c10 = lerp(corner(x0, y0 + 1, z0), corner(x0 + 1, y0 + 1, z0), ux);
  const c01 = lerp(corner(x0, y0, z0 + 1), corner(x0 + 1, y0, z0 + 1), ux);
  const c11 = lerp(corner(x0, y0 + 1, z0 + 1), corner(x0 + 1, y0 + 1, z0 + 1), ux);
  return lerp(lerp(c00, c10, uy), lerp(c01, c11, uy), uz);
}
