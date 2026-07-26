/**
 * Scene dressing — the shrine furniture that sells the hanami island.
 *
 * Everything is authored in integer block coordinates on the shared grid, one
 * uniform block per cell. The island's grass surface is y=0, so props start at
 * y=1.
 */

import type { BlockId } from "../blocks";
import type { VoxelGrid } from "../grid";
import { clusterNoise } from "../light";
import { FACING, HALF, type Facing } from "../shapes";

/**
 * Weathered vermillion. The gate used to be a solid slab of one `shu` block,
 * which at this scale reads as a plastic toy: a 9x14 field of a single flat
 * colour has nothing for the eye to catch on. Mixing in a warmer wood and a
 * darker one in CLUSTERS — never per block, which just reads as static — gives
 * it the patchy, repainted look real vermillion timber has.
 */
function timberAt(x: number, y: number, z: number): BlockId {
  const n = clusterNoise(x, y * 1.6, z, 0.19, 7717);
  if (n > 0.78) return "mangrove";
  if (n < 0.17) return "darkwood";
  return "shu";
}

/**
 * Weathered dark stone for the roof members, mixed the same way. The reference's
 * kasagi is a mottled near-black mass, not one tone.
 */
function stoneAt(x: number, y: number, z: number): BlockId {
  const n = clusterNoise(x, y * 1.4, z, 0.21, 3301);
  if (n > 0.72) return "cobbleddeepslate";
  if (n < 0.28) return "deepslate";
  return "blackstone";
}

/**
 * A filled box whose material varies per cell, so it never reads as one slab.
 *
 * Bounds are SORTED. Callers here mirror geometry with `s = ±1` and naturally
 * write `px, px + s`, which puts x0 above x1 on the left-hand side; an
 * unsorted `for (x = x0; x <= x1)` then runs zero times and silently drops half
 * the structure. That is exactly how the left pillar of this gate went missing.
 */
function mixBox(
  grid: VoxelGrid,
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
  pick: (x: number, y: number, z: number) => BlockId,
): void {
  for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
      for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) {
        grid.set(x, y, z, pick(x, y, z));
      }
}

/**
 * Vermillion torii (鳥居), built with real depth instead of as a flat cut-out.
 *
 * The old one was a 1-block-thick silhouette: correct as a diagram, and it
 * disappeared the moment the camera moved off axis. What gives a real torii its
 * mass, and what this now has:
 *
 *   - PILLARS 2x2 in plan, battered so they lean very slightly inward.
 *   - 稚児柱 CHIGOBASHIRA — the short outrigger posts that brace each pillar,
 *     each with its own little stone cap. In the reference these are half the
 *     structure by area and they are what make it read as built rather than
 *     drawn.
 *   - A STONE KASAGI over a timber SHIMAKI, so the head is two stacked members
 *     of different material, with the ends flicked up on stairs (the 反り).
 *   - BRACKETS under the head at every post, which is where the shadow that
 *     separates head from pillar comes from.
 *   - Hanging lanterns off the kasagi ends, moss at the waterline and vines
 *     trailing down the pillars.
 *
 * Walk-through axis is Z; `oz` is the near face.
 */
export function buildTorii(grid: VoxelGrid, ox: number, oz: number): void {
  const base = 1;
  const top = base + 13; // pillar head
  const half = 7; // pillars at ox±7
  const z0 = oz;
  const z1 = oz + 1; // 2 deep

  // ── main pillars ──
  for (const s of [-1, 1] as const) {
    const px = ox + s * half;
    mixBox(grid, px, base, z0, px + s, top, z1, timberAt);
    // Moss gathers at the foot, where a real post meets wet ground.
    for (const x of [px, px + s])
      for (let z = z0; z <= z1; z++) {
        grid.set(x, base, z, "mossycobble");
        if (clusterNoise(x, base, z, 0.4, 991) > 0.5) {
          grid.set(x, base + 1, z, "moss");
        }
      }
  }

  // ── 亀腹 kamebara: the stone collar each pillar rises out of ──
  // Deliberately NOT the reference photo's forest of outrigger posts. That is a
  // specific gate's bracing, and reproducing it read as a copy AND as clutter at
  // this size. One gate, detailed in its own members: the collar gives the foot
  // weight and the pillar something to emerge from, which is the job those posts
  // were doing in the silhouette.
  for (const s of [-1, 1] as const) {
    const px = ox + s * half; // pillar occupies px and px + s
    for (let x = Math.min(px, px + s) - 1; x <= Math.max(px, px + s) + 1; x++) {
      for (let z = z0 - 1; z <= z1 + 1; z++) {
        for (let y = base; y <= base + 1; y++) {
          grid.set(
            x,
            y,
            z,
            y === base + 1 && clusterNoise(x, y, z, 0.4, 77) > 0.6
              ? "moss"
              : stoneAt(x, y, z),
          );
        }
      }
    }
  }

  // ── 貫 nuki, the lower crossbar — protrudes past both pillars ──
  mixBox(grid, ox - half - 3, top - 4, z0, ox + half + 3, top - 4, z1, timberAt);
  // A second, thinner course under it reads as the wedge (楔) pinning it.
  for (const s of [-1, 1] as const) {
    grid.set(ox + s * (half + 1), top - 5, z0, "darkwood");
    grid.set(ox + s * (half + 1), top - 5, z1, "darkwood");
  }

  // ── 額束 gakuzuka: centre strut carrying the shrine plaque ──
  mixBox(grid, ox, top - 3, z0, ox, top - 1, z1, timberAt);
  grid.set(ox, top - 2, z0 - 1, "gold");
  grid.set(ox - 1, top - 2, z0 - 1, "darkwood");
  grid.set(ox + 1, top - 2, z0 - 1, "darkwood");

  // ── brackets under the head, at each pillar ──
  for (const s of [-1, 1] as const) {
    for (let d = 0; d <= 1; d++) {
      const x = ox + s * (half - d);
      grid.set(x, top, z0 - 1, "darkwood");
      grid.set(x, top, z1 + 1, "darkwood");
    }
  }

  // ── 島木 shimaki (timber) under 笠木 kasagi (stone) ──
  const reach = half + 5;
  mixBox(grid, ox - reach, top + 1, z0 - 1, ox + reach, top + 1, z1 + 1, timberAt);
  mixBox(grid, ox - reach - 1, top + 2, z0 - 1, ox + reach + 1, top + 2, z1 + 1, stoneAt);

  // 反り — the ends flick up. Stairs make the upturn read as a curve rather than
  // as a step, and they are the cheapest curvature in the whole scene.
  for (const s of [-1, 1] as const) {
    const facing: Facing = s > 0 ? FACING.PX : FACING.NX;
    const ex = ox + s * (reach + 2);
    for (let z = z0 - 1; z <= z1 + 1; z++) {
      grid.setShaped(ex, top + 2, z, "ridgestair", facing, HALF.BOTTOM);
      grid.setShaped(ex - s, top + 3, z, "ridgestair", facing, HALF.BOTTOM);
      grid.set(ex - s * 2, top + 3, z, stoneAt(ex, top + 3, z));
    }
    // Gilt finial capping each upturn.
    grid.set(ex - s, top + 4, oz, "gold");
  }

  // ── hanging lanterns off the head ──
  for (const s of [-1, 1] as const) {
    for (const dx of [reach - 1, half - 2]) {
      const x = ox + s * dx;
      grid.set(x, top, z0 - 1, "chain");
      grid.set(x, top - 1, z0 - 1, "hanglantern");
    }
  }

  // ── vines trailing down the pillars ──
  for (const s of [-1, 1] as const) {
    const px = ox + s * half + (s > 0 ? 1 : 0);
    for (const z of [z0 - 1, z1 + 1]) {
      for (let y = top - 6; y > base + 1; y--) {
        if (clusterNoise(px, y, z, 0.5, 4409) < 0.55) break;
        grid.setIfEmpty(px, y, z, "vine");
      }
    }
  }
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
