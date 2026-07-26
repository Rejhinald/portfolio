import { BLOCKS, type BlockId } from "./blocks";

const key = (x: number, y: number, z: number) => `${x},${y},${z}`;

/** Sparse voxel volume keyed by integer block coordinates. */
export class VoxelGrid {
  private cells = new Map<string, BlockId>();

  set(x: number, y: number, z: number, id: BlockId): void {
    this.cells.set(key(x | 0, y | 0, z | 0), id);
  }

  get(x: number, y: number, z: number): BlockId | undefined {
    return this.cells.get(key(x | 0, y | 0, z | 0));
  }

  /** Only fills if the cell is empty — lets terrain win over later decoration. */
  setIfEmpty(x: number, y: number, z: number, id: BlockId): void {
    const k = key(x | 0, y | 0, z | 0);
    if (!this.cells.has(k)) this.cells.set(k, id);
  }

  /** Occludes neighbours (used for face culling + AO). Leaves/air do not. */
  isSolid(x: number, y: number, z: number): boolean {
    const id = this.get(x, y, z);
    if (!id) return false;
    return !BLOCKS[id].transparent;
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
    for (let x = cx - ri; x <= cx + ri; x++)
      for (let z = cz - ri; z <= cz + ri; z++)
        if (Math.hypot(x - cx, z - cz) <= r) this.set(x, y, z, id);
  }

  /** Hollow square ring on the XZ plane (walls). */
  ring(
    cx: number,
    cz: number,
    y: number,
    half: number,
    id: BlockId,
  ): void {
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

  entries(): IterableIterator<[string, BlockId]> {
    return this.cells.entries();
  }

  get size(): number {
    return this.cells.size;
  }
}
