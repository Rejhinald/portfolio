import type { VoxelGrid } from "../grid";

/**
 * Voxel sakura — a full cherry-blossom tree rather than a lollipop.
 *
 * The previous version was a 2x2 stick with one ellipsoid on top, which reads as
 * a shrub next to a 60-block castle. This follows how the reference builds are
 * actually shaped:
 *
 *   - BUTTRESSED ROOTS. Four ridges flare out of the base and taper into the
 *     grass, so the trunk grows out of the ground instead of being planted in it.
 *   - A TAPERING TRUNK, 3x3 at the foot and 2x2 at the head, which is what makes
 *     a voxel trunk read as round.
 *   - LIMBS THAT FORK. Each of the six main limbs staircases outward and up,
 *     and half of them throw a secondary limb part way along, so the branch
 *     structure is visible THROUGH the canopy rather than hidden under it.
 *   - A TWO-LOBED CANOPY with a dip down the middle and a flat underside — the
 *     broad heart silhouette, not a sphere. Built from many overlapping blobs so
 *     its edge is lumpy at more than one frequency.
 *   - HANGING STRANDS of blossom drooping off the underside, which is the detail
 *     that most says "cherry" and the thing a solid dome can never do.
 */

/** Eight compass directions, in clockwise order. */
const DIRS: readonly [number, number][] = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

/** Chance a candidate leaf cell is skipped, so light reads through the canopy. */
const HOLE_CHANCE = 0.1;

/** How far (in normalised radii) a blob's edge wobbles per cell. */
const RAGGED = 0.22;

/**
 * Fill a jittered ellipsoid of leaves. `rx`/`rz` are horizontal radii in blocks,
 * `ry` the vertical one; leaves never overwrite existing blocks (logs win).
 *
 * `squash` lifts the floor of the blob so the underside flattens — a canopy that
 * is hemispherical underneath reads as a ball on a stick.
 */
function leafBlob(
  grid: VoxelGrid,
  cx: number,
  cy: number,
  cz: number,
  rx: number,
  ry: number,
  rng: () => number,
  squash = 0,
): void {
  const ix = Math.ceil(rx);
  const iy = Math.ceil(ry);
  for (let dy = -iy; dy <= iy; dy++) {
    if (dy < -ry * (1 - squash)) continue;
    for (let dx = -ix; dx <= ix; dx++) {
      for (let dz = -ix; dz <= ix; dz++) {
        const nx = dx / rx;
        const ny = dy / ry;
        const nz = dz / rx;
        const d =
          Math.sqrt(nx * nx + ny * ny + nz * nz) + (rng() - 0.5) * 2 * RAGGED;
        if (d > 1) continue;
        if (rng() < HOLE_CHANCE) continue;
        grid.setIfEmpty(cx + dx, cy + dy, cz + dz, "leaves");
      }
    }
  }
}

/** One limb: staircases outward and upward, leaving a cluster at its tip. */
function limb(
  grid: VoxelGrid,
  x0: number,
  y0: number,
  z0: number,
  dx: number,
  dz: number,
  len: number,
  rng: () => number,
): [number, number, number] {
  let [bx, by, bz] = [x0, y0, z0];
  for (let k = 0; k < len; k++) {
    // Diagonals alternate axes so the limb staircases and stays connected.
    if (dx !== 0 && (dz === 0 || k % 2 === 0)) bx += dx;
    else bz += dz;
    // Rises steeply at first then flattens, which is the cherry's vase shape.
    if (k < len * 0.6 || rng() < 0.35) by += 1;
    grid.set(bx, by, bz, "log");
    // Thicken the inner half so the limb does not read as a 1px wire.
    if (k < len * 0.45) grid.setIfEmpty(bx, by - 1, bz, "log");
  }
  return [bx, by, bz];
}

export function buildSakuraTree(
  grid: VoxelGrid,
  ox: number,
  oz: number,
  rng: () => number,
): void {
  const trunkH = 15 + Math.floor(rng() * 4);

  // ── buttressed roots ──
  // Ridges radiating from the foot, each stepping down as it goes out so they
  // taper into the grass rather than ending in a wall.
  for (const [dx, dz] of DIRS) {
    const len = 3 + Math.floor(rng() * 3);
    for (let k = 1; k <= len; k++) {
      const h = Math.max(1, 3 - Math.floor((k * 3) / len));
      for (let y = 1; y <= h; y++) {
        grid.setIfEmpty(ox + dx * k, y, oz + dz * k, "log");
      }
    }
  }

  // ── trunk: 3x3 tapering to 2x2 ──
  const shoulder = Math.floor(trunkH * 0.62);
  grid.box(ox - 1, 1, oz - 1, ox + 1, shoulder, oz + 1, "log");
  grid.box(ox, shoulder + 1, oz, ox + 1, trunkH, oz + 1, "log");

  // ── limbs ──
  const start = Math.floor(rng() * DIRS.length);
  const tips: [number, number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const [dx, dz] = DIRS[(start + i * 3) % DIRS.length];
    const len = 7 + Math.floor(rng() * 4);
    const y0 = shoulder + Math.floor(rng() * (trunkH - shoulder));
    const tip = limb(grid, ox, y0, oz, dx, dz, len, rng);
    tips.push(tip);

    // Half the limbs fork, which is what stops the crown looking radial.
    if (i % 2 === 0) {
      const [fx, fz] = DIRS[(start + i * 3 + (rng() < 0.5 ? 1 : 7)) % DIRS.length];
      const mid: [number, number, number] = [
        Math.round((ox + tip[0]) / 2),
        Math.round((shoulder + tip[1]) / 2) + 1,
        Math.round((oz + tip[2]) / 2),
      ];
      tips.push(limb(grid, mid[0], mid[1], mid[2], fx, fz, 3 + Math.floor(rng() * 3), rng));
    }
  }

  // ── canopy: two lobes with a dip between them ──
  //
  // Vertical radius is nearly as large as the horizontal one. The first attempt
  // used ry 5 against rx 9 and hard-squashed the underside, and it rendered as a
  // pancake on a stick — a cherry's crown is a deep round mass, so the blobs are
  // tall and the squash is only slight.
  const crown = trunkH + 5;
  for (const s of [-1, 1] as const) {
    leafBlob(grid, ox + s * 4, crown, oz + s * 2, 9.5, 8, rng, 0.12);
  }
  // Filler across the middle, lower than the lobes so the dip survives.
  leafBlob(grid, ox, crown - 3, oz, 8, 6.5, rng, 0.18);
  // A smaller cap riding on top, which gives the crown a peak instead of a
  // ceiling and keeps the silhouette from ending in a flat line.
  leafBlob(grid, ox + 1, crown + 4, oz - 1, 6, 4.5, rng, 0.1);

  // A cluster at every limb tip, which is what makes the outline lumpy at a
  // second frequency rather than just noisy at one.
  for (const [tx, ty, tz] of tips) {
    leafBlob(grid, tx, ty + 1, tz, 4 + rng() * 2, 3.5 + rng() * 1.5, rng, 0.15);
  }

  // ── hanging blossom strands ──
  // Dropped from the canopy's underside wherever there is open air below. This
  // is the detail that reads as cherry rather than as any round tree.
  const rx = 14;
  for (let x = ox - rx; x <= ox + rx; x++) {
    for (let z = oz - rx; z <= oz + rx; z++) {
      for (let y = crown + 5; y > 2; y--) {
        if (grid.get(x, y, z) !== "leaves") continue;
        if (grid.has(x, y - 1, z)) break; // not an underside
        if (rng() > 0.3) break;
        const drop = 3 + Math.floor(rng() * 4);
        for (let d = 1; d <= drop; d++) grid.setIfEmpty(x, y - d, z, "leaves");
        break;
      }
    }
  }

  // ── lanterns strung in the branches ──
  // Warm points inside a pink mass, and the same language as the eaves and the
  // torii so the island reads as one lit scene rather than three props.
  let hung = 0;
  for (let attempt = 0; attempt < 90 && hung < 6; attempt++) {
    const a = rng() * Math.PI * 2;
    const r = 4 + rng() * 9;
    const x = ox + Math.round(Math.cos(a) * r);
    const z = oz + Math.round(Math.sin(a) * r);
    for (let y = crown + 4; y > 4; y--) {
      if (grid.get(x, y, z) !== "leaves") continue;
      if (grid.has(x, y - 1, z) || grid.has(x, y - 2, z)) break;
      grid.set(x, y - 1, z, "chain");
      grid.set(x, y - 2, z, "hanglantern");
      hung++;
      break;
    }
  }
}
