/**
 * Voxel Osaka-castle tenshu — white plaster walls, green copper roofs, gold trim.
 *
 * Authored entirely in whole blocks on the shared grid (no scaling of any kind).
 * Footprint is 11x11 on the stone base; the gold finial lands at y=15.
 *
 * Vertical plan (y=0 is the grass surface, so the base starts at y=1):
 *   y1-2    stone base, 11x11 battered in to 9x9
 *   y3-5    tier 1 — 7x7 walls, 9x9 roof
 *   y6-8    tier 2 — 5x5 walls, 7x7 roof
 *   y9-11   tier 3 — 5x5 walls, 7x7 roof
 *   y12-15  tier 4 — 3x3 walls, stepped 5x5 -> 3x3 cap, 1x1 gold finial
 */

import type { VoxelGrid } from "../grid";

/** Plan corners of a square ring — where the eave ornaments go. */
const CORNERS: readonly [number, number][] = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

/** One solid course of the base, speckled with cobble so the masonry reads as rubble. */
function baseCourse(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  y: number,
  half: number,
  rng: () => number,
): void {
  for (let x = ox - half; x <= ox + half; x++) {
    for (let z = oz - half; z <= oz + half; z++) {
      grid.set(x, y, z, rng() < 0.28 ? "cobble" : "stone");
    }
  }
}

/** Hollow plaster wall box — interiors are never visible, so only the ring is filled. */
function walls(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  y0: number,
  y1: number,
  half: number,
): void {
  for (let y = y0; y <= y1; y++) grid.ring(ox, oz, y, half, "plaster");
}

/**
 * A tiered copper roof. `half` is the roof's own half-width, one more than the
 * walls below, so it overhangs by 1 block on every side.
 *
 * The perimeter ring sits a block LOWER than the crown (it shares the top wall
 * course, which is one block narrower) — that step down is the flared eave.
 * The crown above is a solid slab, so the hollow tier is never seen into.
 */
function roof(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  yEave: number,
  half: number,
  rng: () => number,
): void {
  grid.ring(ox, oz, yEave, half, "roof");
  grid.box(ox - half, yEave + 1, oz - half, ox + half, yEave + 1, oz + half, "roof");

  // Sparse gold kazari on the eave tips — gold is the scarce accent, so most get skipped.
  for (const [dx, dz] of CORNERS) {
    if (rng() < 0.4) grid.set(ox + dx * half, yEave, oz + dz * half, "gold");
  }
}

export function buildCastle(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  rng: () => number,
): void {
  // Stone base: solid 11x11 platform battered in to 9x9, leaving a ledge the walls set back from.
  baseCourse(grid, ox, oz, 1, 5, rng);
  baseCourse(grid, ox, oz, 2, 4, rng);

  // Tier 1 — 7x7 walls (y3-y4) under a 9x9 roof (eave y4, crown y5).
  walls(grid, ox, oz, 3, 4, 3);
  roof(grid, ox, oz, 4, 4, rng);

  // Tier 2 — 5x5 walls (y6-y7) under a 7x7 roof (eave y7, crown y8).
  walls(grid, ox, oz, 6, 7, 2);
  roof(grid, ox, oz, 7, 3, rng);

  // Tier 3 — repeats tier 2's plan a floor higher, the way a real tenshu stacks.
  walls(grid, ox, oz, 9, 10, 2);
  roof(grid, ox, oz, 10, 3, rng);

  // Tier 4 — 3x3 watch floor (y12-y13) with a stepped cap: 5x5 eave, then a 3x3 crown.
  walls(grid, ox, oz, 12, 13, 1);
  grid.ring(ox, oz, 13, 2, "roof");
  grid.box(ox - 1, 14, oz - 1, ox + 1, 14, oz + 1, "roof");
  for (const [dx, dz] of CORNERS) {
    if (rng() < 0.5) grid.set(ox + dx * 2, 13, oz + dz * 2, "gold");
  }

  // Gold finial crowning the ridge — the one guaranteed piece of gold.
  grid.set(ox, 15, oz, "gold");
}
