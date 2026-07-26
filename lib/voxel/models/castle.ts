/**
 * Voxel Osaka-castle tenshu, following Cortezerino's block-by-block build:
 * battered stone base, five stacked storeys of white plaster wall, and the
 * flared copper-green roof that repeats identically on every tier.
 *
 * The roof is the whole character of the building, so it is built the way the
 * tutorial builds it rather than as a simple pyramid:
 *   - four courses stepping **2 blocks out for every 1 block down** (a very
 *     shallow Japanese pitch), reaching ~3 blocks past the wall face;
 *   - each course's inner edge meets the previous course's outer edge, so the
 *     shell is continuous and the 1-block recess left at the eave reads as a
 *     soffit rather than a hole;
 *   - the lowest, widest course is the dark deck border, and each corner gets
 *     one block flicked up — the 反り upturn that makes the eave look curved.
 *
 * Gables (千鳥破風) alternate front/back → sides as the tiers rise, exactly as
 * the real tenshu stacks them.
 *
 * Vertical plan (y=0 is the grass surface):
 *   y1-4    stone base, 33x33 battered in to 29x29, gate mouth at the front
 *   y5-14   tier 1 — 29x29 walls, eave out to 35x35
 *   y15-23  tier 2 — 23x23 walls
 *   y24-31  tier 3 — 19x19 walls
 *   y32-38  tier 4 — 15x15 walls
 *   y39-44  tier 5 — 11x11 walls (watch floor)
 *   y45-46  gold finial
 *
 * Each storey's half-width stays within 1 of the ridge plate it stands on, so
 * every tier is actually supported by the roof below it.
 */

import type { BlockId } from "../blocks";
import type { VoxelGrid } from "../grid";
import { clusterNoise } from "../light";
import { HALF, outwardFacing, type Half } from "../shapes";

/**
 * A square ring of oriented slabs/stairs, each turned to face outward from the
 * centre so an eave course slopes away from the building on all four sides.
 */
function ringShaped(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  y: number,
  half: number,
  id: BlockId,
  vhalf: Half,
): void {
  for (let x = ox - half; x <= ox + half; x++)
    for (let z = oz - half; z <= oz + half; z++) {
      const r = Math.max(Math.abs(x - ox), Math.abs(z - oz));
      if (r !== half) continue;
      grid.setShaped(x, y, z, id, outwardFacing(x - ox, z - oz), vhalf);
    }
}

/** Filled square annulus on the XZ plane, inclusive of both radii. */
function annulus(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  y: number,
  inner: number,
  outer: number,
  id: Parameters<VoxelGrid["set"]>[3],
): void {
  for (let x = ox - outer; x <= ox + outer; x++)
    for (let z = oz - outer; z <= oz + outer; z++) {
      const r = Math.max(Math.abs(x - ox), Math.abs(z - oz));
      if (r >= inner && r <= outer) grid.set(x, y, z, id);
    }
}

/**
 * Masonry course. Material varies in CLUSTERS from a smooth noise field, not
 * per block — scattered single blocks average out to flat grey at any distance,
 * whereas patches read as real weathering.
 */
function baseCourse(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  y: number,
  half: number,
  plinthTop: number,
): void {
  for (let x = ox - half; x <= ox + half; x++)
    for (let z = oz - half; z <= oz + half; z++) {
      // Shell only. A solid plinth at this size is ~22k cells whose interior is
      // never visible; the mesher would cull every one of those faces anyway, so
      // they would cost build time and memory for nothing. The top two courses
      // stay solid because the tenshu stands on them.
      const edge = half - Math.max(Math.abs(x - ox), Math.abs(z - oz));
      if (edge > 3 && y < plinthTop - 1) continue;

      const n = clusterNoise(x, y * 2, z, 0.22, 4021);
      const damp = clusterNoise(x, y, z, 0.16, 6607);
      // Height through the plinth, 0 at the footing to 1 at the top course.
      const h = y / plinthTop;

      // Moss only, as a sparse accent low down where water would sit. It is the
      // one non-grey allowed here: brown blocks (dripstone #866c5d, mud brick
      // #89684f) were what made the masonry read muddy instead of stone.
      if (h < 0.5 && damp > 0.82) {
        grid.set(x, y, z, damp > 0.93 ? "moss" : "mossycobble");
        continue;
      }

      // Three measured VALUE tiers, lightest at the top: smooth stone (159) ->
      // the ~125 group -> deepslate (79). Within a tier the choice is texture
      // only, since those blocks are within a few percent of each other and
      // could never read as a gradient on their own.
      let id: BlockId;
      if (h > 0.72) id = n > 0.5 ? "smoothstone" : "diorite";
      else if (h > 0.34) id = n > 0.66 ? "cobble" : n < 0.3 ? "stone" : "stonebrick";
      else id = n > 0.55 ? "deepslate" : "deepslatetiles";
      grid.set(x, y, z, id);
    }
}

/**
 * Window band: 3-wide openings inset 3 blocks from each corner, spaced evenly
 * along all four faces — the tutorial's window rhythm.
 */
function windowBand(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  y0: number,
  y1: number,
  half: number,
): void {
  const span = half - 3; // usable half-run once the corners are kept clear
  if (span < 1) return;
  // Narrow, widely spaced openings. Wider bands read as modern ribbon glazing
  // rather than the sparse slit windows a castle actually has.
  const centres = [0];
  for (let c = 6; c <= span - 1; c += 6) centres.push(c, -c);

  for (const c of centres) {
    for (let d = 0; d <= 1; d++) {
      const t = c + d;
      if (Math.abs(t) > span) continue;
      for (let y = y0; y <= y1; y++) {
        grid.set(ox + t, y, oz - half, "window");
        grid.set(ox + t, y, oz + half, "window");
        grid.set(ox - half, y, oz + t, "window");
        grid.set(ox + half, y, oz + t, "window");
      }
    }
  }
}

/**
 * The gold-and-black band that runs under each eave. The tutorial's repeat is
 * a gold block dead centre, then gold every 4th block outward with black wool
 * filling between — scarce gold, so it stays an accent.
 */
function goldWoolBand(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  y: number,
  half: number,
): void {
  annulus(grid, ox, oz, y, half, half, "wool");
  for (let t = -half; t <= half; t++) {
    if (Math.abs(t) % 4 !== 0) continue;
    grid.set(ox + t, y, oz - half, "gold");
    grid.set(ox + t, y, oz + half, "gold");
    grid.set(ox - half, y, oz + t, "gold");
    grid.set(ox + half, y, oz + t, "gold");
  }
}

/**
 * Wall relief — pilasters standing proud of the wall plane.
 *
 * Taken from how the reference build actually assembles a storey. Read in plan,
 * its wall is not one surface: quartz pilasters project a full block outside the
 * plaster face, at the corners and in groups along each side, with timber posts
 * on a layer behind. A single flat ring of plaster is what made these walls read
 * as cardboard however good the texture on them was.
 *
 * Everything here sits at `half + 1`, i.e. OUTSIDE the wall, so it catches its
 * own light and throws a shadow onto the plaster — which is the whole point.
 */
function wallRelief(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  y0: number,
  y1: number,
  half: number,
  post: BlockId,
): void {
  const d = half + 1;

  const post4 = (t: number, y: number) => {
    grid.set(ox + t, y, oz - d, post);
    grid.set(ox + t, y, oz + d, post);
    grid.set(ox - d, y, oz + t, post);
    grid.set(ox + d, y, oz + t, post);
  };

  for (let y = y0; y <= y1; y++) {
    // Corner returns: an L wrapping each corner, so the corner reads as a solid
    // column rather than two flat edges meeting at a line.
    for (const sx of [-1, 1] as const) {
      for (const sz of [-1, 1] as const) {
        grid.set(ox + sx * d, y, oz + sz * d, "quartzpillar");
        grid.set(ox + sx * d, y, oz + sz * half, "quartzpillar");
        grid.set(ox + sx * half, y, oz + sz * d, "quartzpillar");
      }
    }
    // Mid-wall pilasters in pairs, echoing the reference's grouped quartz.
    for (let c = 6; c <= half - 3; c += 7) {
      for (const s of [-1, 1] as const) {
        post4(s * c, y);
        post4(s * (c + 1), y);
      }
    }
  }

  // A projecting sill at the foot and a cap at the head, tying the pilasters
  // together so they read as a frame rather than as loose sticks.
  for (let t = -d; t <= d; t++) {
    post4(t, y0);
    post4(t, y1);
  }
  for (const sx of [-1, 1] as const)
    for (const sz of [-1, 1] as const) {
      grid.set(ox + sx * d, y0, oz + sz * d, post);
      grid.set(ox + sx * d, y1, oz + sz * d, post);
    }
}

/**
 * Roof tile for a position. Oxidised copper sits at almost the same brightness
 * as prismarine but a clearly different green, so mixing them adds patina
 * variation without breaking the roof's silhouette into light and dark patches —
 * a hue buy rather than a value buy.
 */
function roofAt(x: number, y: number, z: number): BlockId {
  const n = clusterNoise(x, y * 1.4, z, 0.15, 5309);
  if (n > 0.74) return "copper";
  if (n > 0.62) return "coppercut";
  if (n < 0.24) return "roofplain";
  return "roof";
}

/** Fill an annulus with the patina mix rather than one flat material. */
function roofAnnulus(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  y: number,
  inner: number,
  outer: number,
): void {
  for (let x = ox - outer; x <= ox + outer; x++)
    for (let z = oz - outer; z <= oz + outer; z++) {
      const r = Math.max(Math.abs(x - ox), Math.abs(z - oz));
      if (r >= inner && r <= outer) grid.set(x, y, z, roofAt(x, y, z));
    }
}

/**
 * One tiered roof. `wallTop` is the last wall row and `wallHalf` the wall's
 * half-width; the shell descends outward from a ridge plate to a dark eave
 * three blocks clear of the wall.
 */
function tenshuRoof(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  wallTop: number,
  wallHalf: number,
  overhang: number,
  nextHalf: number,
): void {
  // With courses stepping 2 out per 1 down, an `overhang`-block eave needs
  // overhang+1 courses and starts from a ridge plate `overhang` blocks narrower
  // than the wall. Every course's inner edge then meets the outer edge of the
  // one above it, so the shell is continuous.
  const courses = overhang + 1;
  const top = wallTop + overhang;
  const ridgeHalf = Math.max(0, wallHalf - overhang);

  // Ridge plate — solid, so the hollow tier is never seen into. Widened where
  // needed so the tier above actually has something to stand on.
  roofAnnulus(grid, ox, oz, top, 0, Math.max(ridgeHalf, nextHalf));
  for (let i = 1; i < courses - 1; i++) {
    const inner = ridgeHalf + (i - 1) * 2 + 1;
    roofAnnulus(grid, ox, oz, top - i, inner, inner + 1);
  }
  // ── the eave, at half-block resolution ──
  // This edge is the whole character of the roof, and it is where the reference
  // build spends its slabs and stairs. Cubes here give a blunt, stepped rim;
  // stairs give a true slope and a slab tip gives the flare beyond it.
  const eave = wallHalf + overhang;

  // Sloped eave course, then the flared slab tip half a block lower.
  ringShaped(grid, ox, oz, wallTop, eave - 1, "roofstair", HALF.BOTTOM);
  ringShaped(grid, ox, oz, wallTop, eave, "roofslab", HALF.BOTTOM);
  // Dark deck border under the tip — the eave's shadow line.
  //
  // A FULL cube, not a half slab. As a TOP-half slab it met the bottom slab above
  // it correctly, but left a half-block of air below itself, which stranded
  // whatever sat one cell under the eave — the tier below's gable finial, and any
  // leaves the sakura pushed under the overhang.
  annulus(grid, ox, oz, wallTop - 1, eave, eave, "ridge");

  // 反り — the corner flicked up turns a stepped eave into a curved one, which
  // is where the eye lands on a real tenshu. Gold tips it.
  //
  // The corner MUST be a full cube, not another bottom slab: two bottom slabs in
  // adjacent cells each fill only their lower half, leaving a half-block of air
  // between them that reads on screen as a floating block. A full cube spans the
  // whole cell, so it meets the slab below and the gold above with no gap.
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const) {
    grid.set(ox + sx * eave, wallTop, oz + sz * eave, "roofdark");
    grid.set(ox + sx * eave, wallTop + 1, oz + sz * eave, "gold");
  }

  // Lanterns hung in the shadow under the overhang, spaced along each side.
  // These are the scene's light sources at night: because block light spreads by
  // flood fill, sitting them beneath the eave pools warm light along the wall
  // and spills it through the window openings, lighting the storey from outside
  // in — which is what makes the building glow rather than dotting it with lamps.
  // Hung on a short chain from the soffit, the way a real overhang carries them:
  // chain link directly under the eave, lantern swinging below it.
  const under = eave - 1;
  const hang = (hx: number, hz: number) => {
    if (grid.has(hx, wallTop - 1, hz) || grid.has(hx, wallTop - 2, hz)) return;
    grid.set(hx, wallTop - 1, hz, "chain");
    grid.set(hx, wallTop - 2, hz, "hanglantern");
  };
  for (let t = -under + 2; t <= under - 2; t += 5) {
    for (const s of [-1, 1] as const) {
      hang(ox + t, oz + s * under);
      hang(ox + s * under, oz + t);
    }
  }
}

/**
 * A chidori-hafu gable: a flat-topped trapezoid of white trim standing on the
 * roof slope, with a gold rake and a gold finial at the apex.
 * `axis` picks which pair of faces it sits on.
 */
function gable(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  yBase: number,
  wallHalf: number,
  halfW: number,
  height: number,
  axis: "x" | "z",
): void {
  // How far the dormer stands proud of the wall. A flat triangle painted on the
  // wall plane reads as decal; the reference build's gables are dormers with
  // real depth, and the shadow their cheeks cast is most of what sells them.
  const PROJ = 3;

  /** Place at (along-wall t, height y, distance from centre dist). */
  const put = (
    t: number,
    y: number,
    dist: number,
    s: number,
    id: Parameters<VoxelGrid["set"]>[3],
  ) =>
    axis === "z"
      ? grid.set(ox + t, y, oz + s * dist, id)
      : grid.set(ox + s * dist, y, oz + t, id);

  for (const s of [-1, 1] as const) {
    const face = wallHalf + PROJ;

    // Width and height are independent. A 45-degree triangle makes a wide gable
    // a TALL one, which drove the tier-1 gable up into the tier-2 eave; the
    // reference's gables are wide and shallow, so the rake is interpolated.
    for (let r = 0; r <= height; r++) {
      const w = Math.max(0, Math.round(halfW * (1 - r / height)));

      // Front face: white plaster infill inside a green tile border, which is
      // exactly how the reference reads — a bright triangle rimmed in roof.
      for (let t = -w; t <= w; t++) {
        put(t, yBase + r, face, s, Math.abs(t) === w ? "roof" : "plaster");
      }

      // The dormer's own pitched cheeks, receding back to the wall. Without
      // these the triangle floats with nothing joining it to the building.
      for (let j = 0; j < PROJ; j++) {
        put(-w, yBase + r, wallHalf + j, s, "roof");
        put(w, yBase + r, wallHalf + j, s, "roof");
      }
    }

    // Ridge running from the apex back into the roof, then the gold finial.
    for (let j = 0; j <= PROJ; j++) {
      put(0, yBase + height, wallHalf + j, s, "roofdark");
    }
    put(0, yBase + height + 1, face, s, "gold");
    put(0, yBase + height + 1, face - 1, s, "gold");
  }
}

export function buildCastle(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  rng: () => number,
): void {
  // ── stone plinth ──
  // The reference build sits on a 17-course stone platform; the earlier 4 courses
  // were far too shallow and let the tenshu look like it was resting on the lawn.
  // Battered inward as it rises, the way a real 石垣 wall leans back.
  const PLINTH_TOP = 12;
  for (let y = 1; y <= PLINTH_TOP; y++) {
    const half = 22 - Math.floor((y - 1) / 3);
    baseCourse(grid, ox, oz, y, half, PLINTH_TOP);
    // A stair rim caps each batter step so the setbacks read as courses.
    if ((y - 1) % 3 === 2) {
      ringShaped(grid, ox, oz, y, half, "stonebrickstair", HALF.BOTTOM);
    }
  }

  // Gate mouth in the front face of the plinth, at the head of the approach.
  const gateZ = 22;
  for (let t = -2; t <= 2; t++)
    for (let y = 1; y <= 4; y++) {
      grid.set(ox + t, y, gateZ, "window");
      grid.set(ox + t, y, gateZ - 1, "window");
    }
  for (let t = -3; t <= 3; t++) grid.set(ox + t, 5, gateZ, "beam");

  /**
   * Wall rows [y0,y1], half-width, eave overhang, and which axis carries the
   * gable. Each tier's half-width stays within 1 of the ridge plate below it,
   * so every storey is actually supported by the roof it sits on.
   */
  const TIERS: {
    y0: number;
    y1: number;
    half: number;
    overhang: number;
    gable: "x" | "z";
  }[] = [
    { y0: 13, y1: 21, half: 19, overhang: 4, gable: "z" },
    { y0: 26, y1: 33, half: 15, overhang: 4, gable: "x" },
    { y0: 38, y1: 44, half: 12, overhang: 3, gable: "z" },
    { y0: 48, y1: 53, half: 9, overhang: 3, gable: "x" },
    { y0: 57, y1: 62, half: 7, overhang: 3, gable: "z" },
  ];

  TIERS.forEach((tier, i) => {
    const { y0, y1, half, overhang } = tier;
    const nextHalf = TIERS[i + 1]?.half ?? 0;

    // Plaster walls — hollow, since interiors are never visible.
    for (let y = y0; y <= y1; y++) {
      // White supports only TWO readable tiers (snow through calcite all measure
      // within a few percent), so the second one has to be a hue break: warm
      // terracotta against cold plaster, clustered so it reads as weathering.
      for (let x = ox - half; x <= ox + half; x++)
        for (let z = oz - half; z <= oz + half; z++) {
          if (Math.max(Math.abs(x - ox), Math.abs(z - oz)) !== half) continue;
          const w = clusterNoise(x, y * 1.3, z, 0.14, 9133);
          grid.set(x, y, z, w > 0.7 ? "whiteclay" : "plaster");
        }
    }

    // Dark timber sill at the foot of the wall; quartz cornice capping it, with
    // the gold/wool band just beneath. Windows go in the rows between, leaving
    // at least one clear course so the white plaster still reads as a mass.
    // Timber sill, stepping down the wood ramp as the tiers rise so the framing
    // reads as a system rather than one flat brown: 93 -> 68 -> 59 -> 48.
    const WOOD: BlockId[] = ["beam", "mangrove", "darkbeam", "darkwood", "darkwood"];
    annulus(grid, ox, oz, y0, half, half, WOOD[Math.min(i, WOOD.length - 1)]);
    annulus(grid, ox, oz, y1, half, half, "quartz");
    goldWoolBand(grid, ox, oz, y1 - 1, half);
    // Windows get ONE row, not the whole wall. The sill, the gold/wool band and
    // the cornice are already dark or bright; spending three more rows on dark
    // openings left a single course of white plaster and the tenshu read grey.
    const wLo = y0 + 1;
    const wHi = y1 - 2;
    if (wHi >= wLo) {
      const wy = Math.floor((wLo + wHi) / 2);
      windowBand(grid, ox, oz, wy, wy, half);
    }

    // Dark corner posts running each wall's full height — the vertical accent
    // that stops a storey reading as a plain white box.
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ] as const) {
      for (let y = y0; y <= y1; y++) {
        grid.set(ox + sx * half, y, oz + sz * half, WOOD[Math.min(i, WOOD.length - 1)]);
      }
    }

    // Relief BEFORE the roof and gable, so those overwrite it where they meet
    // rather than leaving pilasters poking through an eave.
    wallRelief(grid, ox, oz, y0, y1, half, WOOD[Math.min(i, WOOD.length - 1)]);

    tenshuRoof(grid, ox, oz, y1, half, overhang, nextHalf);
    // Large: in the reference the gable spans most of the wall it sits on,
    // which is what makes the silhouette read as a castle rather than a
    // stack of roofs. Clamped so the smallest tier still has a wall left.
    // Wide but shallow: the width carries the silhouette, while the height is
    // kept clear of the eave belonging to the storey above.
    const gw = Math.max(3, Math.round(half * 0.62));
    const gh = Math.max(3, Math.round(gw * 0.55));
    gable(grid, ox, oz, y1 + 2, half, gw, gh, tier.gable);
  });

  // Gold finial crowning the ridge.
  const last = TIERS[TIERS.length - 1];
  const ridge = last.y1 + last.overhang;
  grid.set(ox, ridge + 1, oz, "gold");
  grid.set(ox, ridge + 2, oz, "gold");

  // Stone lanterns flanking the gate, on the plinth ledge.
  for (const sx of [-1, 1] as const) {
    if (rng() < 0.9) grid.set(ox + sx * 8, PLINTH_TOP + 1, oz + 19, "lantern");
    if (rng() < 0.7) grid.set(ox + sx * 13, PLINTH_TOP + 1, oz + 15, "lantern");
  }
}
