import { BLOCKS } from "./blocks";
import type { VoxelGrid } from "./grid";

const NEIGHBOURS = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
] as const;

/**
 * Delete blocks that touch nothing on any of their six faces.
 *
 * The sakura canopy is a jittered ellipsoid with ~12% of its cells punched out,
 * and that combination reliably strands a handful of single leaf blocks in mid
 * air. One detached pink cube beside the tree is very visible and instantly
 * reads as a bug, so the scene gets swept before it is meshed.
 *
 * Runs repeatedly because removing one orphan can strand its former neighbour;
 * `passes` bounds the work since each sweep is a full walk of the grid.
 */
export function pruneOrphans(grid: VoxelGrid, passes = 3): number {
  let removed = 0;

  for (let p = 0; p < passes; p++) {
    const doomed: [number, number, number][] = [];

    for (const [x, y, z, id] of grid.entries()) {
      // Ground cover is anchored to the surface it stands on by construction and
      // is only ever one cell tall, so it is never an orphan worth pruning.
      if (BLOCKS[id].plant) continue;
      let touching = 0;
      for (const [dx, dy, dz] of NEIGHBOURS) {
        if (grid.has(x + dx, y + dy, z + dz)) {
          touching++;
          break;
        }
      }
      if (touching === 0) doomed.push([x, y, z]);
    }

    if (doomed.length === 0) break;
    for (const [x, y, z] of doomed) grid.clear(x, y, z);
    removed += doomed.length;
  }

  return removed;
}
