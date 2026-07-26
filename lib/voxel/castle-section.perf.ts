import { describe, it, expect } from "vitest";
import { mulberry32 } from "@/lib/three/prng";
import { VoxelGrid } from "@/lib/voxel/grid";
import { BLOCKS, type BlockId } from "@/lib/voxel/blocks";
import { buildCastle } from "@/lib/voxel/models/castle";
import { SHELL_COUNT, SHELL_DATA, SHELL_PALETTE } from "@/lib/voxel/models/castle-shell";

/**
 * Print the castle as an ASCII cross-section, and check the transcription
 * decodes intact.
 *
 *   npm run measure:voxel
 *
 * This file used to compare the build's proportions against numbers measured
 * from the reference world — wall rows vs roof rows, taper per storey — because
 * the castle was hand-generated and those ratios were how it drifted.
 *
 * That comparison is gone, for a good reason: the castle is now TRANSCRIBED from
 * the reference, so it cannot drift from it, and the metric was reporting the
 * reference itself as wrong. It classified a row by sampling a 2-block slice
 * through the centre, which counts whatever interior blocks happen to sit on
 * that line — and the transcription deliberately drops interior blocks the
 * camera cannot see. Measured on the source: the same rule gives 3.09:1 over a
 * 2-block slice and 12.75:1 over the full footprint. A number that swings by 4x
 * on slice width was never measuring the silhouette.
 *
 * What is worth checking now is that the payload survives the trip, so the
 * remaining assertions are about the transcription itself.
 */

/** One character per material family, so the section reads at a glance. */
function sym(id: BlockId | undefined): string {
  if (!id) return " ";
  if (id === "plaster" || id === "whiteclay") return "W";
  if (id.startsWith("quartz")) return "Q";
  if (id === "gold") return "G";
  if (id === "wool") return "K";
  if (id === "window") return "i";
  if (id === "ridge" || id === "roofdark" || id === "deepslatetiles") return "N";
  if (id.startsWith("roof") || id === "copper" || id === "coppercut") return "P";
  if (id === "beam" || id === "darkbeam" || id === "darkwood" || id === "mangrove")
    return "d";
  if (id === "lantern" || id === "hanglantern" || id === "glow") return "*";
  if (BLOCKS[id].plant) return ",";
  return "s";
}

describe("MEASURE", () => {
  it("castle section", () => {
    const grid = new VoxelGrid();
    buildCastle(grid, 0, 0, mulberry32(20260726));

    let maxY = 0;
    let maxR = 0;
    for (const [x, y, z] of grid.entries()) {
      if (y > maxY) maxY = y;
      const r = Math.max(Math.abs(x), Math.abs(z));
      if (r > maxR) maxR = r;
    }

    console.log(`\n=== SECTION at z=0  (width ${maxR * 2 + 1}, height ${maxY}) ===`);
    for (let y = maxY; y >= 1; y--) {
      let row = "";
      for (let x = -maxR; x <= maxR; x++) row += sym(grid.get(x, y, 0));
      if (row.trim()) console.log(`y${String(y).padStart(3)} |${row}|`);
    }

    const kinds = new Map<string, number>();
    for (const [, , , id] of grid.entries()) {
      kinds.set(id, (kinds.get(id) ?? 0) + 1);
    }
    const top = [...kinds].sort((a, b) => b[1] - a[1]).slice(0, 12);
    console.log(`\n=== COMPOSITION (${grid.size} blocks) ===`);
    for (const [id, n] of top) console.log(`  ${String(n).padStart(6)}  ${id}`);
  });

  /**
   * The transcription is a 57 KB base64 blob; a truncated or mis-chunked paste
   * would still typecheck and would still render *something*, just with a
   * missing corner nobody notices until it ships.
   */
  it("transcribed shell decodes intact", () => {
    const bin = atob(SHELL_DATA);
    expect(bin.length % 5, "payload is a whole number of 5-byte records").toBe(0);
    expect(bin.length / 5).toBe(SHELL_COUNT);

    let maxPal = -1;
    const shapes = [0, 0, 0];
    for (let i = 0; i + 4 < bin.length; i += 5) {
      maxPal = Math.max(maxPal, bin.charCodeAt(i + 3));
      const kind = bin.charCodeAt(i + 4) & 3;
      expect(kind, "shape kind is cube, slab or stair").toBeLessThan(3);
      shapes[kind]++;
    }
    expect(maxPal, "every palette index resolves").toBeLessThan(SHELL_PALETTE.length);
    for (const id of SHELL_PALETTE) {
      expect(BLOCKS[id as BlockId], `palette entry ${id} is a real block`).toBeTruthy();
    }
    console.log(
      `\n=== SHELL === ${SHELL_COUNT} blocks  ` +
        `cubes=${shapes[0]} slabs=${shapes[1]} stairs=${shapes[2]}  ` +
        `palette=${SHELL_PALETTE.length}`,
    );
  });
});
