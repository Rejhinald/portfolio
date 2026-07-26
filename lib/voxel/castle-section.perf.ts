import { describe, it } from "vitest";
import { mulberry32 } from "@/lib/three/prng";
import { VoxelGrid } from "@/lib/voxel/grid";
import { BLOCKS, type BlockId } from "@/lib/voxel/blocks";
import { buildCastle } from "@/lib/voxel/models/castle";

/**
 * Print the castle as an ASCII cross-section plus the proportion metrics that
 * can be compared DIRECTLY against the same numbers measured from the reference
 * world save.
 *
 *   npm run measure:voxel
 *
 * Why this exists: six rounds of "does this look right?" were spent eyeballing
 * screenshots against reference slices, and the thing that was actually wrong —
 * an inverted wall-to-roof ratio — is a NUMBER that was visible the whole time.
 * Reading it off the build directly turns an aesthetic argument into a diff.
 *
 * Reference values, measured from Cortezerino's world (see REFERENCE below):
 * every tier is ~5-8 rows of wall under a ~3-row roof, wall:roof about 2.7:1,
 * pitch a dead constant 2 horizontal : 1 vertical, and on all but the top tier
 * the roof dies into the wall above instead of climbing to a ridge.
 */

/** Measured from the reference tenshu — the target this build is compared to. */
const REFERENCE = {
  whiteMassWidth: 43,
  whiteMassHeight: 54,
  plinthCourses: 17,
  wallRowsPerTier: [8, 7, 5],
  roofRowsPerTier: [3, 3, 3],
  wallToRoof: 2.7,
  pitchRunPerRise: 2,
};

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
  it("castle section + proportions vs the reference", () => {
    const grid = new VoxelGrid();
    buildCastle(grid, 0, 0, mulberry32(20260726));

    let maxY = 0;
    let maxR = 0;
    for (const [x, y, z] of grid.entries()) {
      if (y > maxY) maxY = y;
      const r = Math.max(Math.abs(x), Math.abs(z));
      if (r > maxR) maxR = r;
    }

    // --- ASCII section through the centre (x across, y up) ---
    console.log(`\n=== SECTION at z=0  (width ${maxR * 2 + 1}, height ${maxY}) ===`);
    for (let y = maxY; y >= 1; y--) {
      let row = "";
      for (let x = -maxR; x <= maxR; x++) row += sym(grid.get(x, y, 0));
      if (row.trim()) console.log(`y${String(y).padStart(3)} |${row}|`);
    }

    // --- per-layer widths, which is where the taper shows up ---
    const widthAt: number[] = [];
    for (let y = 1; y <= maxY; y++) {
      let w = -1;
      for (let x = -maxR; x <= maxR; x++) {
        if (grid.get(x, y, 0) || grid.get(x, y, 1)) w = Math.max(w, Math.abs(x));
      }
      widthAt[y] = w;
    }

    // A "roof row" is one whose dominant material is roof/ridge; a "wall row" is
    // one dominated by plaster. Counting them straight off the grid is what makes
    // this comparable to the reference numbers rather than a matter of opinion.
    let wallRows = 0;
    let roofRows = 0;
    const kinds: string[] = [];
    for (let y = 1; y <= maxY; y++) {
      const tally = new Map<string, number>();
      for (let x = -maxR; x <= maxR; x++) {
        for (const z of [0, 1]) {
          const c = sym(grid.get(x, y, z));
          if (c !== " ") tally.set(c, (tally.get(c) ?? 0) + 1);
        }
      }
      let best = " ";
      let n = 0;
      for (const [k, v] of tally) if (v > n) [best, n] = [k, v];
      kinds[y] = best;
      if (best === "W") wallRows++;
      if (best === "P" || best === "N") roofRows++;
    }

    const ratio = roofRows ? wallRows / roofRows : Infinity;
    console.log("\n=== PROPORTIONS ===");
    console.log(`  overall            ${maxR * 2 + 1} wide x ${maxY} tall` +
      `  -> ${(maxY / (maxR * 2 + 1)).toFixed(2)} : 1 tall:wide`);
    console.log(`  wall rows          ${wallRows}`);
    console.log(`  roof rows          ${roofRows}`);
    console.log(`  wall:roof          ${ratio.toFixed(2)} : 1` +
      `   REFERENCE ${REFERENCE.wallToRoof} : 1` +
      `   ${ratio >= 2 ? "OK" : "*** INVERTED — roofs too tall / walls too short ***"}`);
    console.log(`  reference white    ${REFERENCE.whiteMassWidth} wide x ` +
      `${REFERENCE.whiteMassHeight} tall -> ` +
      `${(REFERENCE.whiteMassHeight / REFERENCE.whiteMassWidth).toFixed(2)} : 1`);

    // --- taper: how sharply each storey narrows ---
    console.log("\n=== TAPER (per-layer half-width, wall rows only) ===");
    const steps: number[] = [];
    let last = -1;
    for (let y = 1; y <= maxY; y++) {
      if (kinds[y] !== "W") continue;
      if (widthAt[y] !== last) {
        steps.push(widthAt[y]);
        last = widthAt[y];
      }
    }
    console.log(`  storey half-widths: ${steps.join(" -> ")}`);
    for (let i = 1; i < steps.length; i++) {
      const r = steps[i] / steps[i - 1];
      if (r < 1) console.log(`    step ${i}: x${r.toFixed(2)}` +
        `${r < 0.8 ? "   <- steep; a uniform steep taper reads as a pagoda" : ""}`);
    }
  });
});
