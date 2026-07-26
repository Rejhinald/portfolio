import type { BlockId } from "@/lib/voxel/blocks";
import type { VoxelGrid } from "@/lib/voxel/grid";
import { clusterNoise } from "@/lib/voxel/light";

/**
 * Ground cover: the bonemeal pass. Scatters short grass, ferns, flowers and
 * sakura petals across the island's grass so the surface reads as a lawn rather
 * than a flat green plane.
 *
 * Two rules keep it from turning into noise:
 *   - Density comes from a smooth noise field, so plants gather into meadows and
 *     leave bare patches, the way bonemeal actually spreads. Uniform random
 *     scatter reads as static at these on-screen sizes.
 *   - Species are chosen per-patch, not per-plant, so a drift of ferns stays a
 *     drift of ferns instead of a speckle of every plant at once.
 */

/** Chance a cell inside a dense patch actually gets a plant. */
const FILL = 0.78;

export type GroundCoverOpts = {
  /** Scales overall density; 0 skips the pass entirely (low quality tiers). */
  density?: number;
  /** Cells whose column must stay clear — the paved approach, prop footprints. */
  keepClear?: (x: number, z: number) => boolean;
};

/**
 * Pick a species for a patch. Grass dominates, as in a real biome; flowers are
 * the scarce accent that the eye lands on, so they stay rare.
 */
function speciesFor(patch: number, pick: number): BlockId {
  if (patch > 0.78) return pick < 0.5 ? "fern" : "tallgrass";
  if (patch > 0.62) {
    if (pick < 0.16) return "poppy";
    if (pick < 0.32) return "dandelion";
    return "shortgrass";
  }
  return "shortgrass";
}

export function buildGroundCover(
  grid: VoxelGrid,
  rng: () => number,
  bound: number,
  opts: GroundCoverOpts = {},
): number {
  const density = opts.density ?? 1;
  if (density <= 0) return 0;

  let placed = 0;
  // Petals drift on the lee side of the tree, which is where blossom would fall.
  const petalSeed = 7717;

  for (let x = -bound; x <= bound; x++) {
    for (let z = -bound; z <= bound; z++) {
      // Only on exposed grass with nothing already standing on it.
      if (grid.get(x, 0, z) !== "grass") continue;
      if (grid.has(x, 1, z)) continue;
      if (opts.keepClear?.(x, z)) continue;

      // Meadow field: low-frequency, so plants clump into drifts.
      const patch = clusterNoise(x, 0, z, 0.09, 5501);
      const threshold = 0.5 - 0.28 * density;
      if (patch < threshold) continue;
      if (rng() > FILL * density) continue;

      // A separate, tighter field lays pink petals in blossom-fall drifts.
      const petal = clusterNoise(x, 3, z, 0.13, petalSeed);
      const id: BlockId =
        petal > 0.72 ? "petals" : speciesFor(patch, rng());

      grid.set(x, 1, z, id);
      placed++;
    }
  }

  // Overgrowth: vines spilling over the island's rim, where a real overgrown
  // build would let them hang. Kept to the outer edge and to a minority of
  // columns — the ask was "overgrown-ish, but not that much", and vines
  // everywhere would read as a green fringe rather than as age.
  for (let x = -bound; x <= bound; x++) {
    for (let z = -bound; z <= bound; z++) {
      if (grid.get(x, 0, z) !== "grass") continue;
      // Only rim columns: something must be missing beside them to hang from.
      const exposed =
        !grid.has(x + 1, 0, z) ||
        !grid.has(x - 1, 0, z) ||
        !grid.has(x, 0, z + 1) ||
        !grid.has(x, 0, z - 1);
      if (!exposed) continue;
      if (clusterNoise(x, 9, z, 0.19, 3391) < 0.62) continue;
      if (rng() > 0.5) continue;
      const len = 1 + Math.floor(rng() * 3);
      for (let k = 1; k <= len; k++) {
        if (grid.has(x, -k, z)) break;
        grid.set(x, -k, z, "vine");
        placed++;
      }
    }
  }

  return placed;
}
