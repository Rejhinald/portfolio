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

/** Ceiling on cells a single `box`/`line` call may fill. See `box`. */
export const BOX_BUDGET = 4_000_000;

/** Sparse voxel volume keyed by integer block coordinates. */
export class VoxelGrid {
  private cells = new Map<number, BlockId>();
  /** Per-block brightness multiplier, 1 = unpainted. See `light.ts`. */
  private shades = new Map<number, number>();
  /** Per-block emitted-light level 0-15, for night mode. See `light.ts`. */
  private lights = new Map<number, number>();

  /** Orientation for slabs/stairs. Absent = 0 = facing +X, bottom half. */
  private states = new Map<number, number>();

  /**
   * Writes that fell outside the packable range, and total accepted writes.
   *
   * Out-of-range coordinates are DROPPED rather than thrown, so a bad model can
   * never take the hero down in production — but they are counted, and the
   * authoring test asserts the count is zero. Silently accepting them would be
   * worse than either: `key()` biases by 512 and strides by 1024, so a
   * coordinate past ±511 does not error, it ALIASES onto a different cell and
   * corrupts a block somewhere else in the scene.
   *
   * (Pattern borrowed from Ammaar-Alam/minebench's voxel validator, which drops
   * and reports rather than trusting its input.)
   */
  private dropped = 0;
  private writes = 0;

  /** Accepted writes and out-of-range drops, for the authoring invariants. */
  stats(): { writes: number; dropped: number; cells: number } {
    return { writes: this.writes, dropped: this.dropped, cells: this.cells.size };
  }

  private inRange(x: number, y: number, z: number): boolean {
    return (
      x >= -GRID_LIMIT &&
      x <= GRID_LIMIT &&
      y >= -GRID_LIMIT &&
      y <= GRID_LIMIT &&
      z >= -GRID_LIMIT &&
      z <= GRID_LIMIT
    );
  }

  set(x: number, y: number, z: number, id: BlockId): void {
    x |= 0;
    y |= 0;
    z |= 0;
    if (!this.inRange(x, y, z)) {
      this.dropped++;
      return;
    }
    this.writes++;
    this.cells.set(key(x, y, z), id);
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

  /** Block-light level 0-15, from the night-mode flood fill. */
  setLight(x: number, y: number, z: number, level: number): void {
    this.lights.set(key(x | 0, y | 0, z | 0), level);
  }

  getLight(x: number, y: number, z: number): number {
    return this.lights.get(key(x | 0, y | 0, z | 0)) ?? 0;
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
    const xa = Math.min(x0, x1);
    const xb = Math.max(x0, x1);
    const ya = Math.min(y0, y1);
    const yb = Math.max(y0, y1);
    const za = Math.min(z0, z1);
    const zb = Math.max(z0, z1);

    // Expansion budget, charged BEFORE the loop rather than discovered inside
    // it. A transposed digit turns a wall into a 1000-cube and the authoring
    // pass allocates for a minute before anything renders; this fails loudly and
    // immediately instead. The whole scene is ~85k blocks, so 4M is far above
    // any legitimate call and far below "hangs the tab".
    const volume = (xb - xa + 1) * (yb - ya + 1) * (zb - za + 1);
    if (volume > BOX_BUDGET) {
      throw new RangeError(
        `grid.box would fill ${volume} cells (limit ${BOX_BUDGET}) — ` +
          `(${x0},${y0},${z0})..(${x1},${y1},${z1})`,
      );
    }

    for (let x = xa; x <= xb; x++)
      for (let y = ya; y <= yb; y++)
        for (let z = za; z <= zb; z++) this.set(x, y, z, id);
  }

  /**
   * A 3D DDA line, endpoints inclusive.
   *
   * Ported from minebench's voxel primitives, which give models only `block`,
   * `box` and `line` — and `line` is the one we were missing. Every diagonal in
   * this project (limbs, braces, hip ridges, the approach path) was previously a
   * hand-rolled staircase loop, and each one re-derived the same
   * step-the-dominant-axis logic slightly differently.
   *
   * Steps along whichever axis moves furthest, so the result is contiguous under
   * 6-connectivity checks — which matters because the scene invariants reject
   * detached blocks.
   */
  line(
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    id: BlockId,
  ): void {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dz = z1 - z0;
    const steps = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
    if (steps <= 0) {
      this.set(x0, y0, z0, id);
      return;
    }
    if (steps + 1 > BOX_BUDGET) {
      throw new RangeError(`grid.line would fill ${steps + 1} cells`);
    }
    // 6-CONNECTED, unlike a plain DDA. Rounding each axis independently lets a
    // step move two axes at once, so consecutive cells touch only at an edge —
    // and this project's scene invariant rejects blocks with no face-neighbour,
    // so such a line would be flagged as a row of detached cubes. Where a step
    // moves more than one axis, the intervening cells are filled in.
    let px = x0;
    let py = y0;
    let pz = z0;
    this.set(px, py, pz, id);

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const nx = Math.round(x0 + dx * t);
      const ny = Math.round(y0 + dy * t);
      const nz = Math.round(z0 + dz * t);
      while (px !== nx || py !== ny || pz !== nz) {
        if (px !== nx) px += Math.sign(nx - px);
        else if (py !== ny) py += Math.sign(ny - py);
        else pz += Math.sign(nz - pz);
        this.set(px, py, pz, id);
      }
    }
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
  /**
   * Every block as `[x, y, z, id]`.
   *
   * Yields a FRESH tuple per block. It used to reuse one mutable array to avoid
   * ~85k allocations per build, which is safe for `for (const [x,y,z,id] of ...)`
   * — the pattern used everywhere here — but silently corrupts anything that
   * materialises the iterator: `[...grid.entries()]`, `Array.from`, `.map`,
   * `.filter` all end up holding N references to one array showing the LAST
   * block. That cost a debug cycle when a test spread it and got twelve copies
   * of the same coordinate.
   *
   * Measured cost of allocating instead: under a millisecond on an 85k-block
   * scene, against a ~560ms build. Not a trade worth a silent-corruption
   * footgun.
   */
  *entries(): Generator<readonly [number, number, number, BlockId]> {
    for (const [k, id] of this.cells) {
      yield [
        Math.floor(k / (AXIS * AXIS)) - BIAS,
        (Math.floor(k / AXIS) % AXIS) - BIAS,
        (k % AXIS) - BIAS,
        id,
      ] as const;
    }
  }

  get size(): number {
    return this.cells.size;
  }
}
