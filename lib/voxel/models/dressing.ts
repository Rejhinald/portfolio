/**
 * Scene dressing — the small shrine furniture that sells the hanami island.
 *
 * Everything is authored in integer block coordinates on the shared grid, one
 * uniform block per cell. The island's grass surface is y=0, so props start at
 * y=1. Both builders are deterministic (no randomness at all) and only touch
 * the grid through `set`/`box`.
 */

import type { VoxelGrid } from "../grid";

/**
 * Vermillion torii gate (鳥居) in "shu", 1 block thick in Z so it reads as a
 * flat gate you walk through along the Z axis.
 *
 *   y=5   ███████     kasagi (top lintel, overhangs 1 block each side)
 *   y=4   ·█████·     nuki (lower crossbar) tying the post tops together
 *   y=1-4 ·█···█·     the two posts, 4 blocks apart along X
 */
export function buildTorii(grid: VoxelGrid, ox: number, oz: number): void {
  const base = 1; // sits on top of the grass surface
  const top = base + 8; // 9-block-tall posts: y = 1..9
  const half = 4; // posts at ox-4 and ox+4 => 8 blocks apart

  // Two vertical posts (hashira), 2 blocks thick so they carry at this scale.
  for (const s of [-1, 1] as const) {
    grid.box(ox + s * half, base, oz, ox + s * half, top, oz + 1, "shu");
  }

  // Nuki: lower crossbar tying the posts together, two rows below the lintel.
  grid.box(ox - half + 1, top - 2, oz, ox + half - 1, top - 2, oz + 1, "shu");

  // Kasagi: top lintel, overhanging two blocks past each post, with the
  // shimaki course beneath it so the head reads as two stacked beams.
  grid.box(ox - half - 1, top, oz, ox + half + 1, top, oz + 1, "shu");
  grid.box(ox - half - 2, top + 1, oz, ox + half + 2, top + 1, oz + 1, "shu");

  // Gakuzuka: the short strut between nuki and kasagi at the centre.
  grid.box(ox, top - 1, oz, ox, top - 1, oz + 1, "shu");
}

/**
 * Stone lantern (灯籠) — a 6-block column with a flared cap:
 * cobble footing, stone shaft, glowing fire box, overhanging roof.
 */
export function buildLantern(grid: VoxelGrid, ox: number, oz: number): void {
  const base = 1;
  grid.set(ox, base, oz, "cobble"); // rough footing (kiso)
  grid.box(ox, base + 1, oz, ox, base + 2, oz, "stone"); // shaft (sao)
  grid.set(ox, base + 3, oz, "lantern"); // fire box (hibukuro) — lit sides
  // Kasa: a 3x3 flared cap, then a single finial, so it silhouettes properly.
  for (let dx = -1; dx <= 1; dx++)
    for (let dz = -1; dz <= 1; dz++)
      grid.set(ox + dx, base + 4, oz + dz, "stone");
  grid.set(ox, base + 5, oz, "cobble");
}
