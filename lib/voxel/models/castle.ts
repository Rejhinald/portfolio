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
): void {
  for (let x = ox - half; x <= ox + half; x++)
    for (let z = oz - half; z <= oz + half; z++) {
      const n = clusterNoise(x, y * 2, z, 0.22, 4021);
      grid.set(x, y, z, n > 0.62 ? "cobble" : n < 0.34 ? "stone" : "stonebrick");
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
  annulus(grid, ox, oz, top, 0, Math.max(ridgeHalf, nextHalf), "roof");
  for (let i = 1; i < courses - 1; i++) {
    const inner = ridgeHalf + (i - 1) * 2 + 1;
    annulus(grid, ox, oz, top - i, inner, inner + 1, "roof");
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
  axis: "x" | "z",
): void {
  const d = wallHalf + 1; // stands on the course that crosses the wall line
  const put = (t: number, y: number, s: number, id: Parameters<VoxelGrid["set"]>[3]) =>
    axis === "z"
      ? grid.set(ox + t, y, oz + s * d, id)
      : grid.set(ox + s * d, y, oz + t, id);

  for (const s of [-1, 1] as const) {
    for (let r = 0; r < halfW; r++) {
      const w = halfW - r;
      for (let t = -w; t <= w; t++) put(t, yBase + r, s, "quartz");
      // Gold rake down both slopes.
      put(-w, yBase + r, s, "gold");
      put(w, yBase + r, s, "gold");
    }
    // Flat apex plate with a gold crown — the tutorial's gable head.
    put(0, yBase + halfW, s, "gold");
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
  const PLINTH_TOP = 9;
  for (let y = 1; y <= PLINTH_TOP; y++) {
    const half = 17 - Math.floor((y - 1) / 3);
    baseCourse(grid, ox, oz, y, half);
    // A stair rim caps each batter step so the setbacks read as courses.
    if ((y - 1) % 3 === 2) {
      ringShaped(grid, ox, oz, y, half, "stonebrickstair", HALF.BOTTOM);
    }
  }

  // Gate mouth in the front face of the plinth, at the head of the approach.
  const gateZ = 17;
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
    { y0: 10, y1: 16, half: 14, overhang: 3, gable: "z" },
    { y0: 20, y1: 25, half: 11, overhang: 3, gable: "x" },
    { y0: 29, y1: 33, half: 9, overhang: 3, gable: "z" },
    { y0: 37, y1: 40, half: 7, overhang: 3, gable: "x" },
    { y0: 44, y1: 47, half: 5, overhang: 2, gable: "z" },
  ];

  TIERS.forEach((tier, i) => {
    const { y0, y1, half, overhang } = tier;
    const nextHalf = TIERS[i + 1]?.half ?? 0;

    // Plaster walls — hollow, since interiors are never visible.
    for (let y = y0; y <= y1; y++) annulus(grid, ox, oz, y, half, half, "plaster");

    // Dark timber sill at the foot of the wall; quartz cornice capping it, with
    // the gold/wool band just beneath. Windows go in the rows between, leaving
    // at least one clear course so the white plaster still reads as a mass.
    annulus(grid, ox, oz, y0, half, half, "beam");
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
        grid.set(ox + sx * half, y, oz + sz * half, "beam");
      }
    }

    tenshuRoof(grid, ox, oz, y1, half, overhang, nextHalf);
    gable(grid, ox, oz, y1 + 2, half, Math.min(4, half - 3), tier.gable);
  });

  // Gold finial crowning the ridge.
  const last = TIERS[TIERS.length - 1];
  const ridge = last.y1 + last.overhang;
  grid.set(ox, ridge + 1, oz, "gold");
  grid.set(ox, ridge + 2, oz, "gold");

  // Stone lanterns flanking the gate, on the plinth ledge.
  for (const sx of [-1, 1] as const) {
    if (rng() < 0.9) grid.set(ox + sx * 6, PLINTH_TOP + 1, oz + 14, "lantern");
    if (rng() < 0.7) grid.set(ox + sx * 10, PLINTH_TOP + 1, oz + 11, "lantern");
  }
}
