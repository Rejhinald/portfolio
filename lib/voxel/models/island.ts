import { randRange } from "@/lib/three/prng";
import type { BlockId } from "@/lib/voxel/blocks";
import type { VoxelGrid } from "@/lib/voxel/grid";
import { clusterNoise } from "@/lib/voxel/light";

const TAU = Math.PI * 2;

/**
 * Grass cap is y=0; the stone body hangs from y=-5 down to a spike at y=-22.
 * The spike is deliberately short: its lowest courses are hazed into the page
 * anyway, so the vertical budget is better spent on the castle above.
 */
const STONE_TOP_Y = -5;
const TIP_Y = -22;

/** Loop bound — nothing on the island reaches further out than this. */
const BOUND = 32;

/**
 * Which rock sits at a point in the crag.
 *
 * Two ideas from build practice, both deliberate:
 *  - **Stratification.** Real rock reads as horizontal bands, and value gets
 *    darker with depth. So the ramp runs light (calcite/diorite) near the soil,
 *    through the mid greys, down to tuff and deepslate at the tip. Depth does
 *    the work a random mix cannot.
 *  - **Low contrast in the resting areas, high only as an accent.** The rock is
 *    not the focal point — the castle is. The bulk therefore stays inside a
 *    narrow value band (stone/andesite/cobble/gravel, all within a few percent
 *    of each other), and the only high-contrast elements are sparse ore pockets.
 *    Ores are placed in the UPPER third only, because below that the height haze
 *    dissolves the rock into the page and they would simply not read.
 */
function rockAt(x: number, y: number, z: number, t: number): BlockId {
  // Ore pockets: clustered like real veins, never scattered singles.
  if (t < 0.35) {
    const ore = clusterNoise(x, y * 1.7, z, 0.42, 3313);
    if (ore > 0.9) {
      const which = clusterNoise(x, y, z, 0.11, 8821);
      if (which > 0.72) return "goldore";
      if (which > 0.5) return "lapisore";
      if (which > 0.26) return "ironore";
      return "coalore";
    }
  }

  // Banding: a slow vertical field mixed with depth so strata drift rather than
  // sitting in perfectly flat layers.
  const band = clusterNoise(x * 0.35, y * 2.2, z * 0.35, 0.3, 4477);
  const depth = t + (band - 0.5) * 0.28;

  if (depth < 0.1) return band > 0.62 ? "calcite" : "diorite";
  if (depth < 0.28) return band > 0.55 ? "andesite" : "stone";
  if (depth < 0.55) {
    if (band > 0.68) return "cobble";
    if (band < 0.3) return "gravel";
    return "stone";
  }
  if (depth < 0.78) return band > 0.55 ? "tuff" : "cobbleddeepslate";
  return band > 0.5 ? "deepslate" : "cobbleddeepslate";
}

/**
 * Floating island terrain, centred on (0,0): grass cap, three soil layers and a
 * craggy stone spike underneath, plus a winding path and a few rim boulders.
 *
 * Authored entirely in integer block coordinates on the shared grid. Sized to
 * carry the 23-block-wide castle base with room for the tree and torii.
 */
export function buildIsland(grid: VoxelGrid, rng: () => number): void {
  // --- silhouette ----------------------------------------------------------
  // One radius sample per compass direction, cosine-blended between samples so
  // the rim wobbles between ~19 and ~22 blocks instead of being a circle.
  const SAMPLES = 32;
  const rim: number[] = [];
  for (let i = 0; i < SAMPLES; i++) rim.push(randRange(rng, 27, 30));

  /** Rim radius for a direction (radians), smoothly interpolated + wrapped. */
  const rimAt = (angle: number): number => {
    const t = (((angle / TAU) % 1) + 1) * SAMPLES; // shift so negatives wrap
    const i = Math.floor(t) % SAMPLES;
    const f = t - Math.floor(t);
    const s = 0.5 - 0.5 * Math.cos(f * Math.PI); // ease, no hard facets
    return rim[i] * (1 - s) + rim[(i + 1) % SAMPLES] * s;
  };

  // Per-column lookups, computed ONCE and reused by every layer. Recomputing
  // atan2/hypot per cell per layer cost ~30x this over the ~27 stone courses,
  // which is most of the island's build time on a phone.
  const SIDE = BOUND * 2 + 1;
  const rimTable = new Float32Array(SIDE * SIDE);
  const leanTable = new Float32Array(SIDE * SIDE);
  const distTable = new Float32Array(SIDE * SIDE);
  for (let x = -BOUND; x <= BOUND; x++)
    for (let z = -BOUND; z <= BOUND; z++) {
      const i = (x + BOUND) * SIDE + (z + BOUND);
      const a = Math.atan2(z, x);
      rimTable[i] = rimAt(a);
      leanTable[i] = Math.cos(a - 0.6);
      distTable[i] = Math.sqrt(x * x + z * z);
    }

  /**
   * Fill one horizontal slab. `radiusAt` receives the precomputed rim radius
   * and lean factor for the column; `blockAt` is a callback so the stone layers
   * can mix in cobble as they go.
   */
  const slab = (
    y: number,
    radiusAt: (rim: number, lean: number) => number,
    blockAt: (x: number, z: number) => BlockId,
  ): void => {
    for (let x = -BOUND; x <= BOUND; x++)
      for (let z = -BOUND; z <= BOUND; z++) {
        const i = (x + BOUND) * SIDE + (z + BOUND);
        if (distTable[i] <= radiusAt(rimTable[i], leanTable[i]))
          grid.set(x, y, z, blockAt(x, z));
      }
  };

  // Grass cap, then soil layers stepping in so the topsoil visibly tapers
  // before the rock takes over.
  slab(0, (rim) => rim, () => "grass");
  slab(-1, (rim) => rim - 1.5, () => "dirt");
  slab(-2, (rim) => rim - 3, () => "dirt");
  slab(-3, (rim) => rim - 5, () => "dirt");
  slab(-4, (rim) => rim - 7.5, () => "dirt");

  // --- stone body ----------------------------------------------------------
  // Radius follows a convex curve rather than a straight line, so the rock
  // bulges under the soil and then draws down to a point — a hanging crag, not
  // a funnel. Per-layer jitter and a shelf every few courses keep it craggy.
  // Cobble arrives in patches (cluster noise), never as scattered single blocks.
  for (let y = STONE_TOP_Y; y >= TIP_Y; y--) {
    const t = (STONE_TOP_Y - y) / (STONE_TOP_Y - TIP_Y); // 0 at top, 1 at tip
    const shelf = y % 4 === 0 ? 2.2 : 0; // ledges that catch the light
    // Starts NARROWER than the soil above it (the -4 dirt layer is ~rim-7.5),
    // so the rock reads as tucked under the island rather than bulging past it.
    const r = Math.max(
      0.6,
      19 * Math.pow(1 - t, 1.15) + shelf + randRange(rng, -2, 2),
    );
    slab(
      y,
      // Lean the crag off-axis as it descends, so it hangs rather than funnels.
      (rim, lean) => r + 0.3 * (rim - 28.5) + 2 * t * lean,
      (x, z) => rockAt(x, y, z, t),
    );
  }

  // Dripstone spikes hanging off the underside — the cheapest way to break up
  // a smooth silhouette, and silhouette reads as detail far better than
  // interior texture does at this scale.
  for (let i = 0; i < 26; i++) {
    const a = rng() * TAU;
    const rr = randRange(rng, 3, 15);
    const bx = Math.round(Math.cos(a) * rr);
    const bz = Math.round(Math.sin(a) * rr);
    // Find the lowest rock in this column, then hang a taper below it.
    let y = STONE_TOP_Y;
    while (grid.has(bx, y - 1, bz) && y > TIP_Y) y--;
    if (!grid.has(bx, y, bz)) continue;
    const len = 1 + Math.floor(rng() * 4);
    for (let k = 1; k <= len; k++) {
      grid.setIfEmpty(bx, y - k, bz, k === len ? "dripstone" : "dripstone");
    }
  }

  // --- surface dressing ----------------------------------------------------
  // A 2-wide paved approach winding in from the torii toward the castle steps.
  const TRAIL: readonly [number, number][] = [
    [0, 26],
    [0, 25],
    [0, 24],
    [1, 23],
    [1, 22],
    [1, 21],
    [0, 20],
    [0, 19],
    [0, 18],
    [0, 17],
  ];
  for (const [x, z] of TRAIL) {
    grid.set(x, 0, z, "stonebrick");
    grid.set(x + 1, 0, z, "stonebrick");
  }

  // 3-4 loose boulders perched inside the rim, spread roughly evenly around
  // the island, for a bumpier silhouette against the sky.
  const count = 3 + Math.floor(rng() * 2);
  const spin = rng() * TAU;
  for (let i = 0; i < count; i++) {
    const a = spin + (i * TAU) / count + randRange(rng, -0.3, 0.3);
    const r = rimAt(a) - randRange(rng, 2.5, 4.5);
    // Step inward until the rounded cell is safely on grass (never overhanging).
    for (let k = 0; k < 4; k++) {
      const bx = Math.round(Math.cos(a) * (r - k));
      const bz = Math.round(Math.sin(a) * (r - k));
      if (Math.hypot(bx, bz) <= rimAt(Math.atan2(bz, bx)) - 2) {
        grid.set(bx, 1, bz, "stone");
        if (rng() < 0.5) grid.set(bx, 2, bz, "cobble");
        break;
      }
    }
  }
}
