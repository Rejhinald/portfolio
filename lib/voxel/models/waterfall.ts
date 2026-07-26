import type { VoxelGrid } from "../grid";
import { clusterNoise } from "../light";

/**
 * A complete stream: spring pool -> cut channel -> lip -> fall into the haze.
 *
 * It runs ALONG the grass ring rather than straight out from the castle. The
 * plinth is a square of half 33 and the island's rim is a rough circle of radius
 * 40-44, so a radial stream gets three or four blocks of grass before it runs
 * out of island. Tracking the ring at x≈34 gives it thirty-odd blocks to be a
 * stream in before it reaches the edge.
 *
 * SURVEY BEFORE CUTTING. The first version dug as it walked, and near the rim
 * the island's crust is only a block or two thick — sinking the bed two blocks
 * punched a hole clean through it, after which the surface probe returned "no
 * ground" and the whole channel, lip and fall silently failed to build. So the
 * terrain height is sampled for the entire path first, and the bed is only sunk
 * where there is something left underneath.
 *
 * Still and flowing use DIFFERENT textures, as Minecraft itself does:
 * `water_still` for the level pool and channel, `water_flow` for the fall, whose
 * vertical streaks read as movement even in a frozen frame. Both scroll their UV
 * in the fragment shader (`BlockDef.flow`).
 */
export function buildWaterfall(grid: VoxelGrid, rng: () => number): void {
  /** Topmost non-water solid in a column, or null past the island's edge. */
  const surfaceY = (x: number, z: number): number | null => {
    for (let y = 14; y > -30; y--) {
      const id = grid.get(x, y, z);
      if (id && id !== "water" && id !== "waterfall") return y;
    }
    return null;
  };

  /** Is there still ground under `y` here? Guards against digging through. */
  const solidUnder = (x: number, y: number, z: number): boolean => {
    const id = grid.get(x, y - 1, z);
    return !!id && id !== "water" && id !== "waterfall";
  };

  // Centreline: follows the grass ring on the front-right flank, wandering so it
  // never reads as a canal. The castle plinth reaches 33, so 34 keeps it clear.
  const xAt = (z: number) => 34 + Math.round(Math.sin((z + 12) * 0.19) * 2);

  // ── survey the whole path first ──
  const path: { x: number; z: number; y: number }[] = [];
  for (let z = -12; z <= 30; z++) {
    const x = xAt(z);
    const y = surfaceY(x, z);
    if (y === null) break;
    path.push({ x, z, y });
  }
  if (path.length < 6) return;

  // ── spring pool at the head ──
  const head = path[0];
  for (let dx = -2; dx <= 2; dx++)
    for (let dz = -2; dz <= 2; dz++) {
      if (dx * dx + dz * dz > 5) continue;
      const x = head.x + dx;
      const z = head.z + dz;
      const y = surfaceY(x, z);
      if (y === null) continue;
      if (dx * dx + dz * dz > 3) {
        // Mossy stones ringing the spring rather than water, so it has a bank.
        grid.set(x, y, z, clusterNoise(x, y, z, 0.4, 611) > 0.5 ? "moss" : "mossycobble");
        continue;
      }
      grid.set(x, y, z, "water");
      if (solidUnder(x, y - 1, z)) grid.set(x, y - 1, z, "water");
    }

  // ── channel ──
  let lip = path[path.length - 1];
  for (const step of path) {
    for (let dx = -2; dx <= 2; dx++) {
      const x = step.x + dx;
      const y = surfaceY(x, step.z);
      if (y === null) continue;
      if (Math.abs(dx) === 2) {
        // Wet banks, clustered so they are not a uniform grey stripe.
        const n = clusterNoise(x, y, step.z, 0.3, 8123);
        grid.set(x, y, step.z, n > 0.62 ? "mossycobble" : n < 0.3 ? "gravel" : "stone");
        continue;
      }
      grid.set(x, y, step.z, "water");
      // Only deepen where the island can spare it.
      if (solidUnder(x, y, step.z) && solidUnder(x, y - 1, step.z)) {
        grid.set(x, y - 1, step.z, "water");
      }
    }
    lip = step;
  }

  // ── the fall ──
  // Kept SHORT. The height haze fades everything below the rim into the page,
  // so a long fall spends most of its length invisible; ending it while it is
  // still water, and letting the haze finish it, reads far better than a
  // 26-block column of background colour.
  const FALL = 11;
  for (let dx = -2; dx <= 2; dx++) {
    const x = lip.x + dx;
    for (let y = lip.y; y > lip.y - FALL; y--) {
      const depth = lip.y - y;
      const t = depth / FALL;
      // Break-up is deliberately mild. An earlier version skipped blocks with
      // probability (depth-14)*0.12, deleting ~72% of the column by the bottom;
      // with the height haze on top of that the fall was simply not there.
      if (Math.abs(dx) === 2 && depth > 3) continue; // shoulders die off early
      if (Math.abs(dx) === 1 && t > 0.55 && rng() < (t - 0.55) * 0.9) continue;
      if (t > 0.75 && rng() < (t - 0.75) * 1.4) continue;
      grid.set(x, y, lip.z, "waterfall");
      // Two deep at the head so the lip has thickness seen side-on.
      if (depth < 4) grid.set(x, y, lip.z + 1, "waterfall");
    }
  }

  // Vines trailing over the lip — what a constantly wet edge grows, and what
  // stops the fall beginning on a hard horizontal line.
  for (let dx = -2; dx <= 2; dx++) {
    for (let y = lip.y - 1; y > lip.y - 8; y--) {
      if (clusterNoise(lip.x + dx, y, lip.z, 0.45, 5171) < 0.5) break;
      grid.setIfEmpty(lip.x + dx, y, lip.z + 2, "vine");
    }
  }
}
