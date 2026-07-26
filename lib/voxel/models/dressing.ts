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
  const top = base + 3; // 4-block-tall posts: y = 1..4
  const half = 2; // posts at ox-2 and ox+2 => 4 blocks apart

  // Two vertical posts (hashira).
  grid.box(ox - half, base, oz, ox - half, top, oz, "shu");
  grid.box(ox + half, base, oz, ox + half, top, oz, "shu");

  // Nuki: lower crossbar, spanning just the gap between the posts, level with
  // their top block so the three form one continuous beam.
  grid.box(ox - half + 1, top, oz, ox + half - 1, top, oz, "shu");

  // Kasagi: top lintel one block higher, overhanging a block past each post.
  grid.box(ox - half - 1, top + 1, oz, ox + half + 1, top + 1, oz, "shu");
}

/**
 * Stone lantern (灯籠) — a 1x1 column, 4 blocks tall:
 * cobble footing, stone shaft, glowing lantern box, stone cap.
 */
export function buildLantern(grid: VoxelGrid, ox: number, oz: number): void {
  const base = 1;
  grid.set(ox, base, oz, "cobble"); // rough footing (kiso)
  grid.set(ox, base + 1, oz, "stone"); // shaft (sao)
  grid.set(ox, base + 2, oz, "lantern"); // fire box (hibukuro) — lit sides
  grid.set(ox, base + 3, oz, "stone"); // cap (kasa)
}
