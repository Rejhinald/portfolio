import type { VoxelGrid } from "../grid";

/**
 * Voxel sakura tree — one uniform block size, authored in integer block coords.
 *
 * Shape: a 1x1 "log" trunk (with an optional 2x2 flare at the base), 2-4 short
 * log arms staircasing outward+upward from the upper trunk, and a ragged
 * "leaves" blob centred above the trunk top with smaller clusters at each arm
 * tip. The canopy edge is a jittered ellipsoid rather than a clean sphere, and
 * ~12% of cells are punched out, so it reads as Minecraft foliage.
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
  // --- Trunk: 5-6 blocks tall, base sitting on the grass at y=1. ---
  const trunkH = 5 + Math.floor(rng() * 2);
  const topY = trunkH; // topmost log of the main stem
  grid.box(ox, 1, oz, ox, topY, oz, "log");

  // Optional 2x2 flare on the bottom block or two, for a sturdier root.
  if (rng() < 0.6) {
    const fx = rng() < 0.5 ? -1 : 1;
    const fz = rng() < 0.5 ? -1 : 1;
    const flareH = 1 + Math.floor(rng() * 2); // 1-2 blocks of flare
    grid.box(ox, 1, oz, ox + fx, flareH, oz + fz, "log");
  }

  // --- Branches: 2-4 arms, spread apart by striding around the compass. ---
  const armCount = 2 + Math.floor(rng() * 3);
  const start = Math.floor(rng() * DIRS.length);
  const stride = rng() < 0.5 ? 2 : 3; // both keep the picked dirs distinct

  for (let i = 0; i < armCount; i++) {
    const [dx, dz] = DIRS[(start + i * stride) % DIRS.length];
    const len = 2 + Math.floor(rng() * 2); // 2-3 blocks long
    // Spring from the upper third of the trunk.
    let by = topY - 1 - Math.floor(rng() * 2);
    let bx = ox;
    let bz = oz;

    for (let k = 0; k < len; k++) {
      // Diagonals alternate axes so the arm staircases and stays connected.
      if (dx !== 0 && (dz === 0 || k % 2 === 0)) bx += dx;
      else bz += dz;
      by = Math.min(by + 1, topY + 1); // step up, but stay under the canopy top
      grid.set(bx, by, bz, "log");
    }

    // Small puff of blossom at the arm tip.
    leafBlob(grid, bx, by + 1, bz, 2, 1.6, rng);
  }

  // --- Canopy: ~9 wide, 5 tall, centred one block above the trunk top. ---
  leafBlob(grid, ox, topY + 1, oz, 4, 2.6, rng);
}
