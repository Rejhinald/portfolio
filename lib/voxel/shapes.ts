/**
 * Sub-cube block shapes — slabs and stairs.
 *
 * Why this exists: extracting Cortezerino's actual Osaka Castle world showed
 * that **31% of the build is non-cube geometry** (14.8% slabs, 9.4% stairs), and
 * its single most-used castle material is `prismarine_brick_slab`. The flared,
 * stepped eaves that give a tenshu its character are built at HALF-block
 * resolution, so a cube-only mesher flattens them into shelves.
 *
 * Half-block detail is also the cheapest kind of detail there is: it sharpens
 * the silhouette without shrinking the blocks, where simply adding more cubes
 * would shrink them below their own 16px texture and lose detail instead.
 */

/** An axis-aligned box in block-local space, each component in [0,1]. */
export type Box = readonly [
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
];

export type Shape = "cube" | "slab" | "stair" | "chain" | "hanglantern";

/** Which side of the block carries a stair's tall step. */
export const FACING = { PX: 0, NX: 1, PZ: 2, NZ: 3 } as const;
export type Facing = (typeof FACING)[keyof typeof FACING];

/** Bottom or top half, for both slabs and stairs. */
export const HALF = { BOTTOM: 0, TOP: 1 } as const;
export type Half = (typeof HALF)[keyof typeof HALF];

const FULL: Box = [0, 0, 0, 1, 1, 1];
const CUBE_BOXES: readonly Box[] = [FULL];

/**
 * Pack a shape's orientation into one small integer stored alongside the block.
 * Two bits of facing plus one of half is all any slab or stair needs.
 */
export function packState(facing: Facing = FACING.PX, half: Half = HALF.BOTTOM): number {
  return (facing & 3) | ((half & 1) << 2);
}

export const stateFacing = (s: number): Facing => (s & 3) as Facing;
export const stateHalf = (s: number): Half => ((s >> 2) & 1) as Half;

/**
 * Decompose a block into the boxes it actually occupies.
 *
 * A slab is one half-height box. A stair is two: the half-height base plus a
 * quarter box forming the step, on the side named by `facing`. `half: TOP`
 * mirrors the whole thing vertically, which is how Minecraft's upside-down
 * stairs build a soffit under an overhang.
 */
/**
 * Vanilla's chain: a 3/16-wide post running the full height of the block. The
 * real model is two crossed flat quads, but a thin box reads the same at this
 * scale and keeps every block going through one code path.
 */
const CHAIN_BOXES: readonly Box[] = [[0.40625, 0, 0.40625, 0.59375, 1, 0.59375]];

/**
 * Vanilla's hanging lantern: a 6x8x6 body slung under the block's ceiling, with
 * a 2x2 bail above it. Hung rather than standing, so it reads as suspended from
 * the eave instead of resting in mid air.
 */
const HANG_LANTERN_BOXES: readonly Box[] = [
  [0.3125, 0.125, 0.3125, 0.6875, 0.625, 0.6875], // body
  [0.4375, 0.625, 0.4375, 0.5625, 1, 0.5625], // bail up to the ceiling
];

export function shapeBoxes(shape: Shape, state: number): readonly Box[] {
  if (shape === "cube") return CUBE_BOXES;
  if (shape === "chain") return CHAIN_BOXES;
  if (shape === "hanglantern") return HANG_LANTERN_BOXES;

  const top = stateHalf(state) === HALF.TOP;
  const [sy0, sy1] = top ? [0.5, 1] : [0, 0.5]; // the slab part
  const [ty0, ty1] = top ? [0, 0.5] : [0.5, 1]; // the step part

  const base: Box = [0, sy0, 0, 1, sy1, 1];
  if (shape === "slab") return [base];

  let step: Box;
  switch (stateFacing(state)) {
    case FACING.PX:
      step = [0.5, ty0, 0, 1, ty1, 1];
      break;
    case FACING.NX:
      step = [0, ty0, 0, 0.5, ty1, 1];
      break;
    case FACING.PZ:
      step = [0, ty0, 0.5, 1, ty1, 1];
      break;
    default:
      step = [0, ty0, 0, 1, ty1, 0.5];
      break;
  }
  return [base, step];
}

/**
 * Does this shape completely fill the cube? Only full cubes may cull a
 * neighbour's face — treating a slab as an occluder punches holes in whatever
 * sits beside it.
 */
export function isFullShape(shape: Shape): boolean {
  return shape === "cube";
}

/**
 * Outward facing for a block sitting at (dx,dz) relative to a structure's
 * centre, used to orient roof stairs so their step always descends outward.
 */
export function outwardFacing(dx: number, dz: number): Facing {
  if (Math.abs(dx) >= Math.abs(dz)) return dx >= 0 ? FACING.PX : FACING.NX;
  return dz >= 0 ? FACING.PZ : FACING.NZ;
}
