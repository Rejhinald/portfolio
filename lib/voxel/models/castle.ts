/**
 * The Osaka Castle tenshu — TRANSCRIBED from Cortezerino's world save, not
 * generated to look like it.
 *
 * This file used to be a ~600-line generator: a tier table, an eave recipe, a
 * gable builder, wall relief, a skirt roof. Every one of those was my reading of
 * how the reference is put together, and the reference was only ever consulted
 * for aggregate numbers (how many rows are wall, how wide is the tower). The
 * result drifted on exactly the things statistics cannot catch — the roof
 * section, the overhangs, and a palette that included a warm terracotta the real
 * build does not contain anywhere.
 *
 * So the geometry now comes from the save itself. `castle-shell.ts` holds the
 * tenshu's visible blocks, with their real slab/stair orientations, mapped onto
 * this project's atlas tiles. Its roofs are its roofs.
 *
 * What is still authored here is only what the transcription does not cover:
 * the broad battered 石垣 plinth the tower stands on. In the reference that role
 * is played by a bailey rampart (a constant half-34 stone mass up to y13, with
 * the tenshu's own base sitting on it at half 22) which extends far outside the
 * tenshu's footprint and off this island entirely.
 *
 * Vertical plan (y=0 is the grass surface):
 *   y1-12    stone plinth, 67 wide battered in to 51, gate mouth at the front
 *   y13-74   the transcribed tenshu, its own stone base up through the finial
 */

import type { BlockId } from "../blocks";
import type { VoxelGrid } from "../grid";
import { clusterNoise } from "../light";
import { HALF, outwardFacing, type Facing, type Half } from "../shapes";
import { SHELL_COUNT, SHELL_DATA, SHELL_HALF, SHELL_PALETTE } from "./castle-shell";

/**
 * A square ring of oriented slabs/stairs, each turned to face outward from the
 * centre so a course slopes away from the building on all four sides.
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

/** First row of the transcribed tenshu, i.e. the course above the plinth. */
const SHELL_BASE_Y = 13;

/**
 * Quarter-turns to rotate the transcription about its own centre.
 *
 * The save's tenshu faces a direction that has nothing to do with this island,
 * whose approach path and torii come in from +Z. This turns its front to meet
 * them.
 */
const SHELL_TURNS = 0;

/**
 * Stamp the transcribed tenshu into the grid.
 *
 * Records are 5 bytes each — see `castle-shell.ts` for the layout. Decoding is
 * a straight walk over the base64: at ~8.8k blocks this costs well under a
 * millisecond, against ~30ms for the generator it replaces.
 */
function stampShell(grid: VoxelGrid, ox: number, oz: number): void {
  const bin = atob(SHELL_DATA);
  for (let i = 0; i + 4 < bin.length; i += 5) {
    let dx = bin.charCodeAt(i) - SHELL_HALF;
    const dy = bin.charCodeAt(i + 1);
    let dz = bin.charCodeAt(i + 2) - SHELL_HALF;
    const id = SHELL_PALETTE[bin.charCodeAt(i + 3)] as BlockId;
    const s = bin.charCodeAt(i + 4);

    let facing = ((s >> 2) & 3) as Facing;
    for (let t = 0; t < SHELL_TURNS; t++) {
      [dx, dz] = [-dz, dx];
      // FACING is PX,NX,PZ,NZ = 0,1,2,3; a quarter turn maps each to the next
      // axis, so the stairs turn with the geometry rather than pointing off it.
      facing = [2, 3, 1, 0][facing] as Facing;
    }

    const x = ox + dx;
    const y = SHELL_BASE_Y + dy;
    const z = oz + dz;
    const kind = s & 3;
    if (kind === 0) grid.set(x, y, z, id);
    else grid.setShaped(x, y, z, id, facing, ((s >> 4) & 1) as Half);
  }
}

export function buildCastle(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  rng: () => number,
): void {
  // ── stone plinth ──
  // Battered inward as it rises, the way a real 石垣 wall leans back. This
  // stands in for the reference's bailey rampart: there it is a constant
  // half-34 stone mass up to y13 carrying a half-22 tenshu base, which is the
  // ~2:1 podium:tower relationship that separates a fortress from a pagoda.
  const PLINTH_TOP = SHELL_BASE_Y - 1;
  for (let y = 1; y <= PLINTH_TOP; y++) {
    const half = 33 - Math.floor(((y - 1) * 3) / 4);
    baseCourse(grid, ox, oz, y, half, PLINTH_TOP);
    // A stair rim caps each batter step so the setbacks read as courses.
    if ((y - 1) % 3 === 2) {
      ringShaped(grid, ox, oz, y, half, "stonebrickstair", HALF.BOTTOM);
    }
  }

  // Gate mouth in the front face of the plinth, at the head of the approach.
  const gateZ = 33;
  for (let t = -2; t <= 2; t++)
    for (let y = 1; y <= 4; y++) {
      grid.set(ox + t, y, gateZ, "window");
      grid.set(ox + t, y, gateZ - 1, "window");
    }
  for (let t = -3; t <= 3; t++) grid.set(ox + t, 5, gateZ, "beam");

  // ── the tenshu itself ──
  stampShell(grid, ox, oz);

  // Stone lanterns flanking the gate, on the plinth ledge. The transcribed
  // tenshu's own base reaches half 22, so these sit outside that on the ledge
  // the batter leaves behind.
  for (const sx of [-1, 1] as const) {
    if (rng() < 0.9) grid.set(ox + sx * 9, PLINTH_TOP + 1, oz + 23, "lantern");
    if (rng() < 0.7) grid.set(ox + sx * 16, PLINTH_TOP + 1, oz + 23, "lantern");
  }
}

/**
 * Where the transcribed shell lives, for a castle placed at the origin: every
 * cell at or above `SHELL_BASE_Y` within this half-extent came from the world
 * save rather than from code here.
 *
 * Exported so the scene invariants can tell authored geometry from transcribed
 * geometry. They are rules about code we control, and the shell is data.
 */
export const SHELL_FOOTPRINT = { half: 25, baseY: SHELL_BASE_Y } as const;

export { SHELL_COUNT };
