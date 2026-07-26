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
const STONE_TOP_Y = -6;
const TIP_Y = -28;

/** Loop bound — nothing on the island reaches further out than this. */
const BOUND = 36;

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

  // FIVE tiers, each ~25-35% darker than the last — measured, not eyeballed.
  //
  // The previous ramp spent twelve blocks to deliver about four readable steps,
  // because andesite/gravel/cobble/stone/stonebrick all sit within 11% of each
  // other (#888889 down to #7a7a7a). Five slots, one tier. They belong at the
  // SAME tier, chosen between for texture; the gradient has to come from blocks
  // that are genuinely far apart in value.
  //
  // Everything here is neutral grey on purpose. Dripstone (#866c5d) and mud
  // brick (#89684f) are brown, and mixing them into the rock is what made the
  // stone read muddy rather than as a grey gradient.
  if (depth < 0.12) return band > 0.55 ? "calcite" : "diorite"; // 224 / 188
  if (depth < 0.3) return "smoothstone"; //                        159
  if (depth < 0.55) {
    // One tier at ~125, varied only by texture: blobby, coursed, or granular.
    if (band > 0.7) return "cobble";
    if (band > 0.45) return "stonebrick";
    if (band < 0.22) return "gravel";
    return "stone";
  }
  if (depth < 0.78) return band > 0.5 ? "deepslate" : "cobbleddeepslate"; // 79
  if (depth < 0.92) return "deepslatetiles"; //                              55
  return "blackstone"; //                                                    37
}

/**
 * Soil, as a real value ramp. The three vanilla dirts measure 110/102/91 with
 * 22-28% internal noise, so mixing only those reads as ONE flat tone however it
 * is shuffled. The flat terracotta at the bottom is what makes the gradient
 * visible: its step is bigger than the dirts' own speckle.
 */
function soilAt(x: number, y: number, z: number, depth: number): BlockId {
  const n = clusterNoise(x, y * 1.6, z, 0.13, 2207);
  const d = depth + (n - 0.5) * 0.26;
  // THREE tiers, ~35% and ~15% apart. Measured: rooted_dirt 110, dirt 102 and
  // coarse_dirt 91 are all one tier (11-17% apart against 22-28% own noise), so
  // they vary texture only. Podzol and terracotta supply the actual gradient.
  if (d < 0.36) {
    if (n > 0.72) return "coarsedirt"; // 91
    if (n > 0.45) return "rooteddirt"; // 110
    return "dirt"; //                     102
  }
  if (d < 0.72) return "podzol"; //       67
  // Mud is nearly neutral (#3c393d), which is what lets soil hand off to rock
  // without a visible seam; terracotta is the flat, dark brown anchor.
  return n > 0.55 ? "mud" : "brownclay"; // 58 / 56
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
  for (let i = 0; i < SAMPLES; i++) rim.push(randRange(rng, 30, 34));

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

  /** As `slab`, but the radius also needs the column index (faceted rock). */
  const slabIndexed = (
    y: number,
    radiusAt: (idx: number, rim: number) => number,
    blockAt: (x: number, z: number) => BlockId,
  ): void => {
    for (let x = -BOUND; x <= BOUND; x++)
      for (let z = -BOUND; z <= BOUND; z++) {
        const i = (x + BOUND) * SIDE + (z + BOUND);
        if (distTable[i] <= radiusAt(i, rimTable[i]))
          grid.set(x, y, z, blockAt(x, z));
      }
  };

  // Grass cap, then soil layers stepping in so the topsoil visibly tapers
  // before the rock takes over.
  slab(0, (rim) => rim, () => "grass");
  slab(-1, (rim) => rim - 1.5, (x, z) => soilAt(x, -1, z, 0.1));
  slab(-2, (rim) => rim - 3, (x, z) => soilAt(x, -2, z, 0.36));
  slab(-3, (rim) => rim - 5, (x, z) => soilAt(x, -3, z, 0.62));
  slab(-4, (rim) => rim - 7.5, (x, z) => soilAt(x, -4, z, 0.72));
  slab(-5, (rim) => rim - 10, (x, z) => soilAt(x, -5, z, 0.9));

  // --- stone body ----------------------------------------------------------
  // Radius follows a convex curve rather than a straight line, so the rock
  // bulges under the soil and then draws down to a point — a hanging crag, not
  // a funnel. Per-layer jitter and a shelf every few courses keep it craggy.
  // Cobble arrives in patches (cluster noise), never as scattered single blocks.
  // --- iceberg profile ---------------------------------------------------
  // A convex polygon cross-section, tapering LINEARLY with depth: flat facets
  // meeting at hard edges, like the submerged mass of an iceberg. A smooth
  // radius with a power curve gave a rounded funnel; what reads as rock is
  // large planar faces catching light at different angles, and a silhouette
  // made of straight runs rather than a curve.
  const FACETS = 7;
  const facetAngle: number[] = [];
  const facetInset: number[] = [];
  for (let i = 0; i < FACETS; i++) {
    facetAngle.push((i / FACETS) * TAU + randRange(rng, -0.22, 0.22));
    facetInset.push(randRange(rng, 0.74, 1.0));
  }
  /** Distance to the polygon edge in a direction — the min over half-planes. */
  const facetRadius = (cosA: Float32Array, idx: number): number => {
    let r = 1.35;
    for (let i = 0; i < FACETS; i++) {
      const c = cosA[i * SIDE_A + idx];
      if (c > 0.2) r = Math.min(r, facetInset[i] / c);
    }
    return r;
  };
  // Precompute cos(angle - facetAngle) per column, as with the rim table.
  const SIDE_A = SIDE * SIDE;
  const cosA = new Float32Array(FACETS * SIDE_A);
  for (let x = -BOUND; x <= BOUND; x++)
    for (let z = -BOUND; z <= BOUND; z++) {
      const idx = (x + BOUND) * SIDE + (z + BOUND);
      const a = Math.atan2(z, x);
      for (let i = 0; i < FACETS; i++) {
        cosA[i * SIDE_A + idx] = Math.cos(a - facetAngle[i]);
      }
    }

  for (let y = STONE_TOP_Y; y >= TIP_Y; y--) {
    const t = (STONE_TOP_Y - y) / (STONE_TOP_Y - TIP_Y); // 0 at top, 1 at tip
    // Linear taper = straight sides in section, i.e. a wedge. Two abrupt
    // shelves break the silhouette so it is a stack of slabs, not one cone.
    const step = t > 0.42 ? 1.8 : 0;
    const r = Math.max(0.8, 25 * (1 - t) - step + randRange(rng, -0.7, 0.7));
    slabIndexed(
      y,
      (idx, rim) => r * facetRadius(cosA, idx) + 0.22 * (rim - 32),
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
    [0, 31],
    [0, 30],
    [0, 29],
    [1, 28],
    [1, 27],
    [1, 26],
    [0, 25],
    [0, 24],
    [0, 23],
    [0, 22],
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
