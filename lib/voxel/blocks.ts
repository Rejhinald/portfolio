/**
 * Voxel block registry — hanami-tinted Minecraft.
 *
 * Every block is one world-uniform cube (`BLOCK` units). Faces are indexed in
 * three.js BoxGeometry order: 0=+X, 1=-X, 2=+Y, 3=-Y, 4=+Z, 5=-Z.
 */

/**
 * Uniform block size in world units — the single scale for the whole diorama.
 *
 * The build is ~56 blocks across, so this keeps it in the same world-space
 * footprint (~6.5 units) the camera was already framed for. That works out to
 * roughly 10 on-screen px per block on desktop: too small for vanilla's busy
 * 16px tiles, but ample for the flat Bare Bones-style atlas, which has almost
 * no high-frequency detail to alias. The flat textures are what buy the density.
 */
export const BLOCK = 0.115;

export type BlockId =
  | "grass"
  | "dirt"
  | "stone"
  | "cobble"
  | "stonebrick"
  | "log"
  | "leaves"
  | "plank"
  | "beam"
  | "plaster"
  | "quartz"
  | "roof"
  | "roofdark"
  | "wool"
  | "window"
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
 * Atlas tile coordinates. The atlas is an 8x8 grid of 16px tiles (128x128).
 * Row 0: terrain — grass-top, grass-side, dirt, stone, cobble, stone-brick, path
 * Row 1: wood + foliage — log-side, log-end, leaves, plank, beam
 * Row 2: castle — plaster, quartz, roof, roof-dark, wool, window
 * Row 3: accents — gold, shu, lantern-side, lantern-lit
 */
export const TILE = {
  grassTop: [0, 0],
  grassSide: [1, 0],
  dirt: [2, 0],
  stone: [3, 0],
  cobble: [4, 0],
  stonebrick: [5, 0],
  path: [6, 0],
  logSide: [0, 1],
  logEnd: [1, 1],
  leaves: [2, 1],
  plank: [3, 1],
  beam: [4, 1],
  plaster: [0, 2],
  quartz: [1, 2],
  roof: [2, 2],
  roofDark: [3, 2],
  wool: [4, 2],
  window: [5, 2],
  gold: [0, 3],
  shu: [1, 3],
  lanternSide: [2, 3],
  lanternLit: [3, 3],
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
  stonebrick: { faces: all(TILE.stonebrick) },
  plank: { faces: all(TILE.plank) },
  beam: { faces: column(TILE.logEnd, TILE.beam) },
  plaster: { faces: all(TILE.plaster) },
  quartz: { faces: all(TILE.quartz) },
  roof: { faces: all(TILE.roof) },
  roofdark: { faces: all(TILE.roofDark) },
  wool: { faces: all(TILE.wool) },
  window: { faces: all(TILE.window) },
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
