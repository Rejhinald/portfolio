import { describe, it, expect } from "vitest";
import { mulberry32 } from "@/lib/three/prng";
import { VoxelGrid } from "@/lib/voxel/grid";
import { BLOCKS, type BlockId } from "@/lib/voxel/blocks";
import { buildIsland } from "@/lib/voxel/models/island";
import { buildCastle } from "@/lib/voxel/models/castle";
import { buildSakuraTree } from "@/lib/voxel/models/tree";
import { buildTorii } from "@/lib/voxel/models/dressing";
import { buildGroundCover } from "@/lib/voxel/models/groundcover";
import { shapeBoxes } from "@/lib/voxel/shapes";
import { pruneOrphans } from "@/lib/voxel/prune";

/** The real composed scene, exactly as `createVoxelIsland` builds it. */
function buildScene() {
  const rng = mulberry32(20260726);
  const grid = new VoxelGrid();
  buildIsland(grid, rng);
  buildCastle(grid, 0, 0, rng);
  buildSakuraTree(grid, -22, 8, rng);
  buildTorii(grid, 0, 24);
  buildGroundCover(grid, rng, 30, {
    density: 1,
    keepClear: (x, z) => Math.abs(x) <= 2 && z > 14,
  });
  pruneOrphans(grid);
  return grid;
}

const NEIGHBOURS = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
] as const;

describe("composed scene integrity", () => {
  it("has no fully detached blocks", () => {
    const grid = buildScene();
    const orphans: string[] = [];
    for (const [x, y, z, id] of grid.entries()) {
      let touching = 0;
      for (const [dx, dy, dz] of NEIGHBOURS) {
        if (grid.has(x + dx, y + dy, z + dz)) touching++;
      }
      if (touching === 0) orphans.push(`${id}@${x},${y},${z}`);
    }
    expect(orphans, `detached blocks: ${orphans.slice(0, 25).join(" ")}`).toEqual([]);
  });

  /**
   * Half-height blocks are the real hazard: two BOTTOM slabs stacked in adjacent
   * cells leave a half-block of air between them, which reads on screen as a
   * floating block even though both cells are "occupied". This walks every
   * vertical pair and checks the boxes actually meet.
   */
  it("leaves no vertical air gap between stacked sub-cube blocks", () => {
    const grid = buildScene();

    /** Highest and lowest surface of a cell, in absolute block units. */
    const extent = (x: number, y: number, z: number): [number, number] | null => {
      const id = grid.get(x, y, z) as BlockId | undefined;
      if (!id) return null;
      const def = BLOCKS[id];
      if (def.plant) return null; // plants are decoration, not structure
      const boxes = shapeBoxes(def.shape ?? "cube", grid.getState(x, y, z));
      let lo = Infinity;
      let hi = -Infinity;
      for (const b of boxes) {
        lo = Math.min(lo, b[1]);
        hi = Math.max(hi, b[4]);
      }
      return [y - 0.5 + lo, y - 0.5 + hi];
    };

    const gaps: string[] = [];
    for (const [x, y, z, id] of grid.entries()) {
      const def = BLOCKS[id];
      if (def.plant) continue;
      const here = extent(x, y, z);
      const above = extent(x, y + 1, z);
      if (!here || !above) continue;
      // If the cell above is occupied, its underside must meet this top.
      if (above[0] > here[1] + 1e-6) {
        gaps.push(
          `${id}@${x},${y},${z} top=${here[1]} -> ${grid.get(x, y + 1, z)} base=${above[0]}`,
        );
      }
    }
    expect(gaps, `air gaps: ${gaps.slice(0, 25).join(" | ")}`).toEqual([]);
  });
});
