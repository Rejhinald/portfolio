import { randRange } from "@/lib/three/prng";
import type { BlockId } from "@/lib/voxel/blocks";
import type { VoxelGrid } from "@/lib/voxel/grid";

const TAU = Math.PI * 2;

/** Grass cap is y=0; the stone body hangs from y=-3 down to a spike at y=-14. */
const STONE_TOP_Y = -3;
const TIP_Y = -14;

/** Loop bound — nothing on the island reaches further out than this. */
const BOUND = 15;

/**
 * Floating island terrain, centred on (0,0): grass cap, two dirt layers and a
 * craggy stone spike underneath, plus a winding path and a few rim boulders.
 *
 * Authored entirely in integer block coordinates on the shared grid.
 */
export function buildIsland(grid: VoxelGrid, rng: () => number): void {
  // --- silhouette ----------------------------------------------------------
  // One radius sample per compass direction, cosine-blended between samples so
  // the rim wobbles between ~11.5 and ~13.5 blocks instead of being a circle.
  const SAMPLES = 24;
  const rim: number[] = [];
  for (let i = 0; i < SAMPLES; i++) rim.push(randRange(rng, 11.5, 13.5));

  /** Rim radius for a direction (radians), smoothly interpolated + wrapped. */
  const rimAt = (angle: number): number => {
    const t = (((angle / TAU) % 1) + 1) * SAMPLES; // shift so negatives wrap
    const i = Math.floor(t) % SAMPLES;
    const f = t - Math.floor(t);
    const s = 0.5 - 0.5 * Math.cos(f * Math.PI); // ease, no hard facets
    return rim[i] * (1 - s) + rim[(i + 1) % SAMPLES] * s;
  };

  /**
   * Fill one horizontal slab. `radiusOf` may vary per direction; `blockAt` is a
   * callback so the stone layers can mix in cobble as they go.
   */
  const slab = (
    y: number,
    radiusOf: (angle: number) => number,
    blockAt: () => BlockId,
  ): void => {
    for (let x = -BOUND; x <= BOUND; x++)
      for (let z = -BOUND; z <= BOUND; z++)
        if (Math.hypot(x, z) <= radiusOf(Math.atan2(z, x)))
          grid.set(x, y, z, blockAt());
  };

  // Grass cap, then two dirt layers stepping in ~1 and ~2.5 blocks so the
  // topsoil visibly tapers before the rock takes over.
  slab(0, rimAt, () => "grass");
  slab(-1, (a) => rimAt(a) - 1, () => "dirt");
  slab(-2, (a) => rimAt(a) - 2.5, () => "dirt");

  // --- stone body ----------------------------------------------------------
  // Radius shrinks roughly linearly from ~10 to a 1-block point. Per-layer
  // jitter (+/-1) plus a little of the rim wobble keeps it craggy, not conical.
  // ~8% of the rock is cobble for texture variation.
  for (let y = STONE_TOP_Y; y >= TIP_Y; y--) {
    const t = (STONE_TOP_Y - y) / (STONE_TOP_Y - TIP_Y); // 0 at top, 1 at tip
    const r = Math.max(0.6, 10 - 9.4 * t + randRange(rng, -1, 1));
    slab(
      y,
      (a) => r + 0.4 * (rimAt(a) - 12.5),
      () => (rng() < 0.08 ? "cobble" : "stone"),
    );
  }

  // --- surface dressing ----------------------------------------------------
  // A 1-wide trail winding in from the torii side toward the castle door.
  const TRAIL: readonly [number, number][] = [
    [4, 5],
    [4, 4],
    [3, 3],
    [3, 2],
    [2, 2],
    [2, 1],
    [1, 1],
    [1, 0],
    [0, -1],
  ];
  for (const [x, z] of TRAIL) grid.set(x, 0, z, "path");

  // 2-3 loose boulders perched inside the rim, spread roughly evenly around
  // the island, for a bumpier silhouette against the sky.
  const count = 2 + Math.floor(rng() * 2);
  const spin = rng() * TAU;
  for (let i = 0; i < count; i++) {
    const a = spin + (i * TAU) / 3 + randRange(rng, -0.3, 0.3);
    const r = rimAt(a) - randRange(rng, 2.5, 3.5);
    // Step inward until the rounded cell is safely on grass (never overhanging).
    for (let k = 0; k < 3; k++) {
      const bx = Math.round(Math.cos(a) * (r - k));
      const bz = Math.round(Math.sin(a) * (r - k));
      if (Math.hypot(bx, bz) <= rimAt(Math.atan2(bz, bx)) - 1) {
        grid.set(bx, 1, bz, "stone");
        break;
      }
    }
  }
}
