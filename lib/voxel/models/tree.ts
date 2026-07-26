import type { VoxelGrid } from "../grid";

/**
 * Voxel sakura tree — one uniform block size, authored in integer block coords.
 *
 * Shape: a 2x2 "log" trunk on a wider root flare, 3-5 log arms staircasing
 * outward+upward from the upper trunk, and a ragged "leaves" blob centred above
 * the trunk top with smaller clusters at each arm tip. The canopy edge is a
 * jittered ellipsoid rather than a clean sphere, and ~12% of cells are punched
 * out, so it reads as Minecraft foliage.
 */

/** Eight compass directions for branch arms, in clockwise order. */
const DIRS: readonly [number, number][] = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

/** Chance a candidate leaf cell is skipped, so light reads through the canopy. */
const HOLE_CHANCE = 0.12;

/** How far (in normalised radii) the canopy edge wobbles per cell. */
const RAGGED = 0.2;

/**
 * Fill a jittered ellipsoid of leaves. `rx`/`rz` are horizontal radii in blocks,
 * `ry` the vertical one; leaves never overwrite existing blocks (logs win).
 */
function leafBlob(
  grid: VoxelGrid,
  cx: number,
  cy: number,
  cz: number,
  rx: number,
  ry: number,
  rng: () => number,
): void {
  const ix = Math.ceil(rx);
  const iy = Math.ceil(ry);
  for (let dy = -iy; dy <= iy; dy++) {
    for (let dx = -ix; dx <= ix; dx++) {
      for (let dz = -ix; dz <= ix; dz++) {
        const nx = dx / rx;
        const ny = dy / ry;
        const nz = dz / rx;
        // Normalised distance + per-cell noise => bumpy, non-spherical edge.
        const d =
          Math.sqrt(nx * nx + ny * ny + nz * nz) + (rng() - 0.5) * 2 * RAGGED;
        if (d > 1) continue;
        if (rng() < HOLE_CHANCE) continue;
        grid.setIfEmpty(cx + dx, cy + dy, cz + dz, "leaves");
      }
    }
  }
}

export function buildSakuraTree(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  rng: () => number,
): void {
  // --- Trunk: 9-11 blocks tall, 2x2, base sitting on the grass at y=1. ---
  const trunkH = 9 + Math.floor(rng() * 3);
  const topY = trunkH; // topmost log of the main stem
  grid.box(ox, 1, oz, ox + 1, topY, oz + 1, "log");

  // Root flare: a wider foot spreading into the grass.
  const flareH = 1 + Math.floor(rng() * 2);
  grid.box(ox - 1, 1, oz - 1, ox + 2, flareH, oz + 2, "log");

  // --- Branches: 3-5 arms, spread apart by striding around the compass. ---
  const armCount = 3 + Math.floor(rng() * 3);
  const start = Math.floor(rng() * DIRS.length);
  const stride = rng() < 0.5 ? 2 : 3; // both keep the picked dirs distinct

  for (let i = 0; i < armCount; i++) {
    const [dx, dz] = DIRS[(start + i * stride) % DIRS.length];
    const len = 4 + Math.floor(rng() * 3); // 4-6 blocks long
    // Spring from the upper third of the trunk.
    let by = topY - 2 - Math.floor(rng() * 3);
    let bx = ox;
    let bz = oz;

    for (let k = 0; k < len; k++) {
      // Diagonals alternate axes so the arm staircases and stays connected.
      if (dx !== 0 && (dz === 0 || k % 2 === 0)) bx += dx;
      else bz += dz;
      by = Math.min(by + 1, topY + 2); // step up, but stay under the canopy top
      grid.set(bx, by, bz, "log");
    }

    // Puff of blossom at the arm tip.
    leafBlob(grid, bx, by + 1, bz, 3.5, 2.6, rng);
  }

  // --- Canopy: ~15 wide, 9 tall, centred above the trunk top. ---
  leafBlob(grid, ox, topY + 2, oz, 7, 4.5, rng);
}
