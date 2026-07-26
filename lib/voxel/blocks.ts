/**
 * Voxel block registry — hanami-tinted Minecraft.
 *
 * Every block is one world-uniform cube (`BLOCK` units). Faces are indexed in
 * three.js BoxGeometry order: 0=+X, 1=-X, 2=+Y, 3=-Y, 4=+Z, 5=-Z.
 */

/**
 * Uniform block size in world units — the single scale for the whole diorama.
 * Chosen so a ~13-block island radius fills roughly the same world space as the
 * old low-poly island (13 * 0.26 ≈ 3.4) while keeping blocks visually chunky:
 * below ~16 on-screen px a voxel stops reading as a block and turns to noise.
 */
export const BLOCK = 0.26;

export type BlockId =
  | "grass"
  | "dirt"
  | "stone"
  | "cobble"
  | "log"
  | "leaves"
  | "plank"
  | "plaster"
  | "roof"
  | "gold"
  | "shu"
  | "lantern"
  | "path";

export type BlockDef = {
  /** Atlas tile [col,row] per face in +X,-X,+Y,-Y,+Z,-Z order. */
  faces: [number, number][];
  /** Cutout (alpha-tested) layer instead of opaque — leaves. */
  cutout?: boolean;
  /** Sways in the wind (foliage); top vertices only, trunk stays rigid. */
  foliage?: boolean;
  /** Does not occlude neighbours for AO/culling purposes (like MC glass/leaves). */
  transparent?: boolean;
};

/**
 * Atlas tile coordinates. The atlas is a 4x4 grid of 16px tiles (64x64).
 * Row 0: grass-top, grass-side, dirt, stone
 * Row 1: cobble, log-side, log-end, leaves
 * Row 2: plank, plaster, roof, gold
 * Row 3: shu, lantern-side, lantern-lit, path
 */
export const TILE = {
  grassTop: [0, 0],
  grassSide: [1, 0],
  dirt: [2, 0],
  stone: [3, 0],
  cobble: [0, 1],
  logSide: [1, 1],
  logEnd: [2, 1],
  leaves: [3, 1],
  plank: [0, 2],
  plaster: [1, 2],
  roof: [2, 2],
  gold: [3, 2],
  shu: [0, 3],
  lanternSide: [1, 3],
  lanternLit: [2, 3],
  path: [3, 3],
} as const satisfies Record<string, readonly [number, number]>;

const all = (t: readonly [number, number]): [number, number][] =>
  Array.from({ length: 6 }, () => [t[0], t[1]] as [number, number]);

/** top/bottom/side split, like MC's cube_bottom_top. */
const topBottomSide = (
  top: readonly [number, number],
  bottom: readonly [number, number],
  side: readonly [number, number],
): [number, number][] => [
  [side[0], side[1]],
  [side[0], side[1]],
  [top[0], top[1]],
  [bottom[0], bottom[1]],
  [side[0], side[1]],
  [side[0], side[1]],
];

/** end/side split, like MC's cube_column (logs). */
const column = (
  end: readonly [number, number],
  side: readonly [number, number],
): [number, number][] => topBottomSide(end, end, side);

export const BLOCKS: Record<BlockId, BlockDef> = {
  // Grass sides are pre-composited (dirt with a green fringe) per MC's
  // grass_block_side, so we don't need a second tinted overlay quad.
  grass: { faces: topBottomSide(TILE.grassTop, TILE.dirt, TILE.grassSide) },
  dirt: { faces: all(TILE.dirt) },
  stone: { faces: all(TILE.stone) },
  cobble: { faces: all(TILE.cobble) },
  log: { faces: column(TILE.logEnd, TILE.logSide) },
  leaves: {
    faces: all(TILE.leaves),
    cutout: true,
    foliage: true,
    transparent: true,
  },
  plank: { faces: all(TILE.plank) },
  plaster: { faces: all(TILE.plaster) },
  roof: { faces: all(TILE.roof) },
  gold: { faces: all(TILE.gold) },
  shu: { faces: all(TILE.shu) },
  lantern: {
    faces: topBottomSide(TILE.lanternSide, TILE.lanternSide, TILE.lanternLit),
  },
  path: { faces: all(TILE.path) },
};

/**
 * Vanilla per-face brightness — compile-time constants, NOT lighting.
 * Verified against decompiled BlockModelRenderer.EnumNeighborInfo and Sodium's
 * AoNeighborInfo: UP 1.0, DOWN 0.5, N/S (±Z) 0.8, E/W (±X) 0.6.
 * Order matches BoxGeometry faces: +X,-X,+Y,-Y,+Z,-Z.
 */
export const FACE_SHADE = [0.6, 0.6, 1.0, 0.5, 0.8, 0.8] as const;

/**
 * Vanilla Smooth Lighting quantises to exactly four values. This is the 0fps
 * AO lookup remapped: shade = 0.4 + 0.2 * ao, ao ∈ 0..3.
 */
export const AO_SHADE = [0.4, 0.6, 0.8, 1.0] as const;

/**
 * 0fps ambient occlusion for a face corner.
 * `side1`/`side2` are the two edge neighbours, `corner` the diagonal one.
 * Returns 0..3 (0 = most occluded).
 */
export function vertexAO(side1: boolean, side2: boolean, corner: boolean): number {
  if (side1 && side2) return 0;
  return 3 - (Number(side1) + Number(side2) + Number(corner));
}
