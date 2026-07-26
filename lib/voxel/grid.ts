import { BLOCKS, type BlockId } from "./blocks";
import { isFullShape, packState, type Facing, type Half } from "./shapes";

/**
 * Coordinate packing. Each axis is biased into [0,1023] and packed into one
 * 30-bit integer, which V8 keeps as a small integer (SMI) — so a Map lookup
 * costs no string allocation at all.
 *
 * This matters: meshing asks `isSolid` 13 times per face (1 cull test + 12 AO
 * neighbour samples), so a 25k-block scene does ~2M lookups. With template
 * -string keys that was ~2M throwaway strings and a visible hitch on mobile.
 */
const BIAS = 512;
const AXIS = 1024;
const key = (x: number, y: number, z: number) =>
  (((x + BIAS) * AXIS + (y + BIAS)) * AXIS + (z + BIAS)) | 0;

/** Largest coordinate magnitude the packing can represent. */
export const GRID_LIMIT = BIAS - 1;

/** Sparse voxel volume keyed by integer block coordinates. */
export class VoxelGrid {
  private cells = new Map<number, BlockId>();
  /** Per-block brightness multiplier, 1 = unpainted. See `light.ts`. */
  private shades = new Map<number, number>();

  /** Orientation for slabs/stairs. Absent = 0 = facing +X, bottom half. */
  private states = new Map<number, number>();

  set(x: number, y: number, z: number, id: BlockId): void {
    this.cells.set(key(x | 0, y | 0, z | 0), id);
  }

  /** Place an oriented slab or stair. */
  setShaped(
    x: number,
    y: number,
    z: number,
    id: BlockId,
    facing: Facing,
    half: Half,
  ): void {
    const k = key(x | 0, y | 0, z | 0);
    this.cells.set(k, id);
    this.states.set(k, packState(facing, half));
  }

  getState(x: number, y: number, z: number): number {
    return this.states.get(key(x | 0, y | 0, z | 0)) ?? 0;
  }

  /**
   * Painted brightness for one block, multiplied into its baked vertex colour.
   * This is how the diorama gets deep eave shadows, grounded bases and
   * under-window streaks — surface interest from *light* rather than from
   * scattering odd blocks around, which just reads as grey mush at distance.
   */
  setShade(x: number, y: number, z: number, v: number): void {
    this.shades.set(key(x | 0, y | 0, z | 0), v);
  }

  getShade(x: number, y: number, z: number): number {
    return this.shades.get(key(x | 0, y | 0, z | 0)) ?? 1;
  }

  get(x: number, y: number, z: number): BlockId | undefined {
    return this.cells.get(key(x | 0, y | 0, z | 0));
  }

  /** Only fills if the cell is empty — lets terrain win over later decoration. */
  setIfEmpty(x: number, y: number, z: number, id: BlockId): void {
    const k = key(x | 0, y | 0, z | 0);
    if (!this.cells.has(k)) this.cells.set(k, id);
  }

  /** Removes a cell, so a later pass can carve openings (windows, doorways). */
  clear(x: number, y: number, z: number): void {
    this.cells.delete(key(x | 0, y | 0, z | 0));
  }

  /**
   * Blocks light — used for ambient occlusion and the skylight pass. A slab or
   * stair does cast shade even though it cannot cull a neighbour's face, so this
   * deliberately ignores shape. Leaves and plants are transparent and do not.
   */
  isSolid(x: number, y: number, z: number): boolean {
    const id = this.cells.get(key(x | 0, y | 0, z | 0));
    if (!id) return false;
    return !BLOCKS[id].transparent;
  }

  /**
   * Fills its cell completely, so it may hide the neighbouring face. ONLY full
   * cubes qualify: treating a slab as an occluder would punch visible holes in
   * whatever sits beside it.
   */
  isFullOpaque(x: number, y: number, z: number): boolean {
    const id = this.cells.get(key(x | 0, y | 0, z | 0));
    if (!id) return false;
    const def = BLOCKS[id];
    return !def.transparent && isFullShape(def.shape ?? "cube");
  }

  has(x: number, y: number, z: number): boolean {
    return this.cells.has(key(x | 0, y | 0, z | 0));
  }

  /** Inclusive box fill. */
  box(
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    id: BlockId,
  ): void {
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
      for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
        for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
          this.set(x, y, z, id);
  }

  /** Filled disc on the XZ plane at height y. */
  disc(cx: number, cz: number, y: number, r: number, id: BlockId): void {
    const ri = Math.ceil(r);
    const r2 = r * r;
    for (let x = cx - ri; x <= cx + ri; x++)
      for (let z = cz - ri; z <= cz + ri; z++) {
        const dx = x - cx;
        const dz = z - cz;
        if (dx * dx + dz * dz <= r2) this.set(x, y, z, id);
      }
  }

  /** Hollow square ring on the XZ plane (walls). */
  ring(cx: number, cz: number, y: number, half: number, id: BlockId): void {
    for (let x = cx - half; x <= cx + half; x++)
      for (let z = cz - half; z <= cz + half; z++)
        if (
          x === cx - half ||
          x === cx + half ||
          z === cz - half ||
          z === cz + half
        )
          this.set(x, y, z, id);
  }

  /**
   * Iterate every filled cell as decoded coordinates. Yields into a single
   * reused tuple — the mesher reads it immediately and never retains it, which
   * keeps a 25k-block walk allocation-free.
   */
  *entries(): Generator<readonly [number, number, number, BlockId]> {
    const out: [number, number, number, BlockId] = [0, 0, 0, "stone"];
    for (const [k, id] of this.cells) {
      out[0] = Math.floor(k / (AXIS * AXIS)) - BIAS;
      out[1] = (Math.floor(k / AXIS) % AXIS) - BIAS;
      out[2] = (k % AXIS) - BIAS;
      out[3] = id;
      yield out;
    }
  }

  get size(): number {
    return this.cells.size;
  }
}
