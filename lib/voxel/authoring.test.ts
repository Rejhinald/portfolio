import { describe, it, expect } from "vitest";
import { mulberry32 } from "@/lib/three/prng";
import { VoxelGrid, BOX_BUDGET } from "@/lib/voxel/grid";
import { buildIsland } from "@/lib/voxel/models/island";
import { buildCastle } from "@/lib/voxel/models/castle";
import { buildSakuraTree } from "@/lib/voxel/models/tree";
import { buildTorii } from "@/lib/voxel/models/dressing";
import { buildWaterfall } from "@/lib/voxel/models/waterfall";

/**
 * Authoring invariants — does the code that writes blocks actually write them?
 *
 * These exist because of two bugs that shipped through a green typecheck, a
 * green lint and 46 green tests, and were only caught by eye afterwards:
 *
 *   1. `buildWaterfall` built NOTHING. It dug its channel as it walked, punched
 *      through the island's thin rim crust, and the surface probe then reported
 *      "no ground" — so the channel, lip and fall all returned early. Every
 *      existing test passed, because they only ever asserted things about blocks
 *      that DO exist.
 *   2. The torii drew only its right half. Its box helper iterated `x0..x1` and
 *      the mirrored caller passed `px, px + s`, so on the left `x0 > x1` and the
 *      loop ran zero times. The entire left pillar was missing.
 *
 * Both are the same shape of failure: work silently not happening. Nothing in a
 * type system or a "no detached blocks" check can see it, because the absence of
 * geometry is never invalid — it is just empty.
 *
 * The drop accounting and expansion budget are ported from
 * Ammaar-Alam/minebench's voxel validator, which counts and reports what it
 * refuses instead of trusting its input.
 */

/** Floors set at roughly 60% of the real figure, so they catch collapse rather than drift. */
const FLOORS = {
  island: 25_000,
  castle: 15_000,
  tree: 1_200,
  torii: 250,
  waterfall: 150,
} as const;

describe("authoring invariants", () => {
  it("every model actually builds something", () => {
    const rng = mulberry32(20260726);

    const island = new VoxelGrid();
    buildIsland(island, rng);

    const castle = new VoxelGrid();
    buildCastle(castle, 0, 0, rng);

    const tree = new VoxelGrid();
    buildSakuraTree(tree, 0, 0, rng);

    const torii = new VoxelGrid();
    buildTorii(torii, 0, 0);

    // The waterfall reads the finished terrain, so it needs a real island.
    // Counted by BLOCK ID, not by net-new cells: the channel is CUT into the
    // terrain, replacing grass rather than adding cells, so a cell delta
    // undercounts it to near nothing and would make this floor meaningless.
    const water = new VoxelGrid();
    buildIsland(water, mulberry32(20260726));
    buildWaterfall(water, rng);
    let waterBlocks = 0;
    for (const [, , , id] of water.entries()) {
      if (id === "water" || id === "waterfall") waterBlocks++;
    }

    const got = {
      island: island.stats().cells,
      castle: castle.stats().cells,
      tree: tree.stats().cells,
      torii: torii.stats().cells,
      waterfall: waterBlocks,
    };
    console.log("authored blocks:", got);

    for (const [name, floor] of Object.entries(FLOORS)) {
      expect(
        got[name as keyof typeof got],
        `${name} built far fewer blocks than expected — did it return early?`,
      ).toBeGreaterThan(floor);
    }
  });

  /**
   * Mirrored props must have balanced halves.
   *
   * A 15% tolerance, not exact symmetry: materials are chosen from a noise field
   * and the vines use `setIfEmpty`, so the two sides legitimately differ block
   * for block. A whole missing pillar is a ~40% imbalance and trips this
   * immediately, which is exactly the bug it exists for.
   */
  it("the torii is symmetric about its own axis", () => {
    const grid = new VoxelGrid();
    buildTorii(grid, 0, 0);

    let left = 0;
    let right = 0;
    for (const [x] of grid.entries()) {
      if (x < 0) left++;
      else if (x > 0) right++;
    }
    const skew = Math.abs(left - right) / Math.max(left, right);
    expect(
      skew,
      `torii halves are lopsided: ${left} left vs ${right} right`,
    ).toBeLessThan(0.15);
  });

  it("no model writes outside the packable coordinate range", () => {
    // Out-of-range writes do not throw — `key()` would silently ALIAS them onto
    // a different cell and corrupt an unrelated block, so the grid drops and
    // counts them instead. That count must be zero.
    const rng = mulberry32(20260726);
    const grid = new VoxelGrid();
    buildIsland(grid, rng);
    buildCastle(grid, 0, 0, rng);
    buildSakuraTree(grid, -36, 12, rng);
    buildTorii(grid, 0, 39);
    buildWaterfall(grid, rng);

    const { dropped, writes } = grid.stats();
    expect(dropped, `${dropped} of ${writes} writes fell outside the grid`).toBe(0);
  });

  it("box fills the same cells whichever corner is given first", () => {
    const a = new VoxelGrid();
    a.box(-2, 1, -3, 4, 5, 6, "stone");
    const b = new VoxelGrid();
    b.box(4, 5, 6, -2, 1, -3, "stone");
    expect(b.stats().cells).toBe(a.stats().cells);
    expect(a.stats().cells).toBe(7 * 5 * 10);
  });

  it("box refuses an absurd volume instead of hanging the build", () => {
    const grid = new VoxelGrid();
    expect(() => grid.box(0, 0, 0, 400, 400, 400, "stone")).toThrow(/limit/);
    expect(400 ** 3).toBeGreaterThan(BOX_BUDGET);
  });

  it("line is inclusive and contiguous", () => {
    const grid = new VoxelGrid();
    grid.line(0, 0, 0, 6, 3, -2, "beam");

    expect(grid.get(0, 0, 0)).toBe("beam");
    expect(grid.get(6, 3, -2)).toBe("beam");
    // Steps along the dominant axis, so every cell touches the previous one.
    // 6-connected, so it is at least as long as the manhattan distance.
    expect(grid.stats().cells).toBeGreaterThanOrEqual(7);

    const cells = [...grid.entries()].map(([x, y, z]) => [x, y, z] as const);
    for (const [x, y, z] of cells) {
      if (x === 0 && y === 0 && z === 0) continue;
      const touching = cells.some(
        ([ox, oy, oz]) =>
          Math.abs(ox - x) + Math.abs(oy - y) + Math.abs(oz - z) === 1,
      );
      expect(touching, `line cell ${x},${y},${z} is detached`).toBe(true);
    }
  });
});
