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

  const put4 = (t: number, y: number, id: BlockId) => {
    grid.set(ox + t, y, oz - half, id);
    grid.set(ox + t, y, oz + half, id);
    grid.set(ox - half, y, oz + t, id);
    grid.set(ox + half, y, oz + t, id);
  };

  for (const c of centres) {
    // A framed opening, not a slit. Dark timber posts either side and a lintel
    // above turn each window into a bay, and it is that repeated bay rhythm —
    // not the glazing — that gives the wall band its detail. Two-block-tall
    // openings so they read at all at this on-screen size.
    for (let d = 0; d <= 1; d++) {
      const t = c + d;
      if (Math.abs(t) > span) continue;
      for (let y = y0; y <= y1; y++) put4(t, y, "window");
    }
    // Lintel only — no side posts. Full-height dark posts beside every opening
    // competed with the pilasters and read as damage rather than framing. The
    // reference keeps its walls nearly blank so the windows carry the rhythm;
    // white space is what makes them legible at a distance.
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

  /** Pilasters are WHITE, as in the reference. Dark timber here made the walls
   *  read brown; the reference's projecting pilasters are quartz, and the dark
   *  timber is reserved for the horizontal sill and cap. */
  const post4 = (t: number, y: number, id: BlockId = "quartzpillar") => {
    grid.set(ox + t, y, oz - d, id);
    grid.set(ox + t, y, oz + d, id);
    grid.set(ox - d, y, oz + t, id);
    grid.set(ox + d, y, oz + t, id);
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
      // ONE pilaster per bay, not a pair. Doubling them halved the clear white
      // between bays, which is the surface the windows need to read against.
      for (const s of [-1, 1] as const) post4(s * c, y);
      void post; // pilasters are quartz; `post` is only for the sill and cap
    }
  }

  // A projecting sill at the foot and a cap at the head, tying the pilasters
  // together so they read as a frame rather than as loose sticks.
  for (let t = -d; t <= d; t++) {
    post4(t, y0, post);
    post4(t, y1, post);
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

/**
 * Fill a roof course, splitting tread from riser.
 *
 * Each 2:1 step already has a one-block vertical face where the course drops —
 * the 小壁 kokabe riser. Giving that outer cell a different value from the inner
 * one costs NO extra geometry and is what makes the field read as stacked tile
 * courses instead of a smooth ramp. It is the cheapest relief on the whole roof.
 */
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
      if (r < inner || r > outer) continue;
      // Outermost ring of the course is the riser. Only a SLIGHT step down in
      // value: the riser is a side face (FACE_SHADE 0.8) while the tread is a top
      // face (1.0), so the geometry already darkens it ~20% for free. Using a
      // genuinely dark block here double-darkened it into muddy black bands,
      // where the reference has crisp lines on bright teal.
      grid.set(
        x,
        y,
        z,
        r === outer && outer > inner ? "coppercut" : roofAt(x, y, z),
      );
    }
}

/**
 * 裳階 mokoshi — the skirt roof.
 *
 * A subsidiary roof band wrapping the tower PARTWAY UP a storey, below that
 * storey's own roof. It is not an eave and not a tier: it is a decorative pent
 * roof whose whole job is to make the tower read as having more storeys than it
 * structurally has, by breaking a tall wall into two banded registers.
 *
 * This is what the reference has that no amount of thickening an existing eave
 * could reproduce — the missing element was a whole extra roof, not more trim on
 * the ones already there.
 *
 * Two courses so it has its own visible thickness: green tiles with a thin slab
 * tip, over a dark soffit. It deliberately projects LESS than the main eave
 * above it, so the silhouette still steps outward as it descends.
 */
function mokoshi(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  y: number,
  wallHalf: number,
  project: number,
): void {
  const tip = wallHalf + project;
  // Full cubes throughout, including the tip. A half-slab tip is a magnet for
  // half-block gaps whenever anything lands above it, and at this on-screen size
  // the extra half block of thinness bought nothing.
  roofAnnulus(grid, ox, oz, y, wallHalf + 1, tip);
  // Dark underside, one course down, so the band reads as a solid mass from
  // below rather than as a paper flange.
  annulus(grid, ox, oz, y - 1, wallHalf + 1, tip, "ridge");
  // Gilt bracket at each corner, matching the main eaves' language.
  for (const sx of [-1, 1] as const)
    for (const sz of [-1, 1] as const) {
      grid.set(ox + sx * tip, y, oz + sz * tip, "gold");
    }
}

/** Outer radius of a tier's eave. */
const eaveRadius = (wallHalf: number, overhang: number) => wallHalf + overhang;

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

  // ── 降り棟 kudari-mune: raised hip ridges ──
  //
  // The roof FIELD was the last flat surface. Edge trim alone could not fix it,
  // because a stepped ramp with detail only at its rim is still a ramp. This is
  // the walls' treatment applied to the roof: a line standing a full block PROUD
  // of the tile surface, running down each 45-degree hip from the ridge plate to
  // the eave corner, so it catches light on top and throws a shadow across the
  // tiles beside it.
  //
  // It is also what a real tenshu has — every hip of every tier carries one — and
  // it is what turns four flat planes into a roof with edges.
  // A real kudari-mune is masonry — several courses of flat tile capped by a
  // coping — standing 2-3 tiles proud and 3 wide. A 1x1 line reads as a seam and
  // casts nothing, which is exactly why the first attempt changed so little.
  // Two courses high and three wide throws a shadow band across the field beside
  // it: the pilaster trick, turned onto the diagonal.
  const hip = (r: number, y: number) => {
    for (const sx of [-1, 1] as const)
      for (const sz of [-1, 1] as const) {
        const cx = ox + sx * r;
        const cz = oz + sz * r;
        // Base course, 3 wide across the run of the diagonal.
        grid.set(cx, y, cz, "ridge");
        grid.set(cx - sx, y, cz, "ridge");
        grid.set(cx, y, cz - sz, "ridge");
        // Coping, one narrower and one higher, so the profile steps in.
        grid.set(cx, y + 1, cz, "deepslatetiles");
      }
  };
  for (let i = 1; i < courses - 1; i++) {
    const inner = ridgeHalf + (i - 1) * 2 + 1;
    // One course higher than the tiles it rides on, hence the +1.
    hip(inner, top - i + 1);
    hip(inner + 1, top - i + 1);
  }
  // Carry the hip down onto the eave course so it reaches the upturned corner
  // rather than stopping short in mid-slope.
  hip(eaveRadius(wallHalf, overhang) - 1, wallTop + 1);
  // ── the eave, at half-block resolution ──
  // This edge is the whole character of the roof, and it is where the reference
  // build spends its slabs and stairs. Cubes here give a blunt, stepped rim;
  // stairs give a true slope and a slab tip gives the flare beyond it.
  const eave = eaveRadius(wallHalf, overhang);

  // ── the eave as a THICK assembly, not a lip ──
  //
  // This was the actual complaint and I kept fixing the wrong thing. The
  // overhang was one half-slab plus a dark line: about a block and a half of
  // total thickness, so from the side it read as a thin shelf. The reference's
  // eave is a stacked mass several courses deep, and that depth is the whole
  // reason its roofs look heavy.
  //
  // Three visible bands now: sloped tiles on top, a solid green body beneath
  // them projecting one block further out as a drip lip, and a dark soffit under
  // that. Each course meets the one above, so there are no gaps.
  ringShaped(grid, ox, oz, wallTop, eave - 1, "roofstair", HALF.BOTTOM);
  ringShaped(grid, ox, oz, wallTop, eave, "roofslab", HALF.BOTTOM);
  roofAnnulus(grid, ox, oz, wallTop - 1, eave - 1, eave + 1);
  // Dark deck border under the tip — the eave's shadow line.
  //
  // A FULL cube, not a half slab. As a TOP-half slab it met the bottom slab above
  // it correctly, but left a half-block of air below itself, which stranded
  // whatever sat one cell under the eave — the tier below's gable finial, and any
  // leaves the sakura pushed under the overhang.
  // Dark underside kept NARROW. At three cells wide it read as another wall
  // layer rather than as the thin shadow line under an eave — the roof mass
  // should be thick, its dark fascia should not.
  annulus(grid, ox, oz, wallTop - 2, eave, eave + 1, "ridge");

  // ── eave depth ──
  // An overhang this deep was reading as a flat plate seen edge-on, because
  // nothing broke its underside. The reference tucks dark timber under there;
  // in a real roof those are the exposed rafter tails (垂木), and they are what
  // gives an eave visible thickness and rhythm from below.
  const tails = (t: number) => {
    grid.setIfEmpty(ox + t, wallTop - 3, oz - eave, "darkbeam");
    grid.setIfEmpty(ox + t, wallTop - 3, oz + eave, "darkbeam");
    grid.setIfEmpty(ox - eave, wallTop - 3, oz + t, "darkbeam");
    grid.setIfEmpty(ox + eave, wallTop - 3, oz + t, "darkbeam");
  };
  for (let t = -eave + 1; t <= eave - 1; t += 3) tails(t);
  // Corner rafters run past the corner, which is where a Japanese eave is
  // deepest and where the upturn needs something to spring from.
  for (const sx of [-1, 1] as const)
    for (const sz of [-1, 1] as const) {
      grid.setIfEmpty(ox + sx * eave, wallTop - 3, oz + sz * eave, "darkbeam");
      grid.setIfEmpty(ox + sx * (eave - 1), wallTop - 3, oz + sz * eave, "darkbeam");
      grid.setIfEmpty(ox + sx * eave, wallTop - 3, oz + sz * (eave - 1), "darkbeam");
    }

  // NO repeating gold along the fascia. Gold is punctuation: spread thinly over
  // every eave it stopped meaning anything, and the corner onigawara and gable
  // peaks — the places it should mark — lost their emphasis. Removing it makes
  // the gold that remains read as richer, not poorer.

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
    // 鬼瓦 onigawara — the mass that terminates each hip ridge at the corner.
    // Taller and wider than the ridge it caps, in gold, because this is the
    // corner the eye actually lands on and it reads against sky at any distance.
    // Full-cube plinth across all three corner cells first. The eave ring here is
    // half-slabs, and gold set straight onto those left a half-block of air under
    // the wings — an onigawara sits on a solid corner block regardless.
    grid.set(ox + sx * eave, wallTop, oz + sz * eave, "roofdark");
    grid.set(ox + sx * (eave - 1), wallTop, oz + sz * eave, "roofdark");
    grid.set(ox + sx * eave, wallTop, oz + sz * (eave - 1), "roofdark");
    grid.set(ox + sx * eave, wallTop + 1, oz + sz * eave, "gold");
    grid.set(ox + sx * eave, wallTop + 2, oz + sz * eave, "gold");
    grid.set(ox + sx * (eave - 1), wallTop + 1, oz + sz * eave, "gold");
    grid.set(ox + sx * eave, wallTop + 1, oz + sz * (eave - 1), "gold");
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

      // Front face, built in layers rather than as one flat triangle:
      //   green tile border -> gilt rake just inside it -> plaster field.
      // The tutorial puts a gold block on every stair of the gable diagonal, and
      // that bright line following the slope is what stops the face reading as a
      // blank panel.
      for (let t = -w; t <= w; t++) {
        const a = Math.abs(t);
        // 破風 hafu — the bargeboards. Two cells thick with a DARK outer edge, so
        // they read as boards with a shadowed lip rather than as a painted line.
        // Gold every other course inside them is punctuation, not an outline: a
        // solid gilt rake swamped the white field it exists to frame.
        //
        // 妻 tsuma — the white face. Kept dominantly white, broken only by narrow
        // vertical timber marks on a regular beat, which is what the reference
        // uses and what stops a big plaster triangle reading as a blank sheet.
        let id: BlockId;
        if (a === w) id = "roofdark";
        else if (a === w - 1 && w >= 2) id = "roof";
        else if (a === w - 2 && w >= 3 && r % 2 === 0) id = "gold";
        else if (w >= 5 && a % 3 === 1 && r > 0 && r < height - 1) id = "darkbeam";
        else id = "plaster";
        put(t, yBase + r, face, s, id);
      }

      // The dormer's own pitched cheeks, receding back to the wall. Without
      // these the triangle floats with nothing joining it to the building.
      for (let j = 0; j < PROJ; j++) {
        put(-w, yBase + r, wallHalf + j, s, "roof");
        put(w, yBase + r, wallHalf + j, s, "roof");
      }
      // Its own little roof, one cell outside the bargeboard along the whole
      // rake — the chidori-hafu is a roofed dormer, not a triangle drawn on the
      // slope, and this is the course that caps it.
      if (w + 1 <= halfW) {
        put(-(w + 1), yBase + r, face, s, "roof");
        put(w + 1, yBase + r, face, s, "roof");
      }
    }

    // Centre medallion: the chiselled-quartz boss the tutorial sets in the middle
    // of every gable, ringed in gold. One focal point per face, which is what the
    // eye actually lands on.
    if (halfW >= 4 && height >= 3) {
      const my = yBase + Math.max(1, Math.round(height * 0.38));
      put(0, my, face, s, "quartzchiseled");
      put(-1, my, face, s, "gold");
      put(1, my, face, s, "gold");
      put(0, my - 1, face, s, "gold");
    }

    // NOTE: no rafter tails under the dormer. Where the tier's overhang equals
    // PROJ the dormer face lands on exactly the eave ring's radius, so a beam
    // below it sits on a half-slab and leaves a visible half-block of air. The
    // main eave's own rafters already read under that overhang anyway.

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
      // Two rows where the storey can afford it: a single-row opening is a slit
      // at this scale and gave the wall band no rhythm at all.
      windowBand(grid, ox, oz, wy, Math.min(wy + 1, wHi), half);
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

    // A skirt roof only makes sense on a storey with enough wall to divide —
    // on a short one it would simply collide with its own eave.
    if (y1 - y0 >= 5 && half >= 9) {
      // Projection must stay clear of the main eave's soffit, which reaches
      // eave-1 = half+overhang-1; overlapping it left a half-block gap where the
      // skirt's slab tip met the soffit above.
      mokoshi(
        grid,
        ox,
        oz,
        y0 + Math.floor((y1 - y0) / 2) + 1,
        half,
        Math.max(2, overhang - 2),
      );
    }

    tenshuRoof(grid, ox, oz, y1, half, overhang, nextHalf);
    // Large: in the reference the gable spans most of the wall it sits on,
    // which is what makes the silhouette read as a castle rather than a
    // stack of roofs. Clamped so the smallest tier still has a wall left.
    // Wide but shallow: the width carries the silhouette, while the height is
    // kept clear of the eave belonging to the storey above.
    // Larger and steeper. The gable is the build's strongest graphic element and
    // the one the eye reads first; at 0.62 of the wall it was competing with the
    // roofs rather than anchoring the facade.
    const gw = Math.max(3, Math.round(half * 0.8));
    const gh = Math.max(3, Math.round(gw * 0.62));
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
