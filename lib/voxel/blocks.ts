/**
 * Voxel block registry — real Minecraft block textures on a uniform cube grid.
 *
 * Faces are indexed in three.js BoxGeometry order: 0=+X, 1=-X, 2=+Y, 3=-Y,
 * 4=+Z, 5=-Z.
 */

import { TILE } from "./atlas-tiles";
import type { Shape } from "./shapes";

/**
 * Uniform block size in world units — the single scale for the whole diorama.
 *
 * The build is ~56 blocks across, which keeps it in the ~6.5 unit world footprint
 * the camera is framed for. At dpr 2 that is roughly 13 *device* pixels per
 * block, i.e. close to 1:1 against a 16px Minecraft tile — the point at which
 * real block textures read as themselves rather than as mush. Going much denser
 * shrinks blocks below their own texture resolution and *loses* detail.
 */
export const BLOCK = 0.115;

export type BlockId =
  // surface
  | "grass"
  | "dirt"
  | "coarsedirt"
  | "rooteddirt"
  | "moss"
  | "mud"
  | "podzol"
  | "mudbrick"
  | "brownclay"
  // rock, light -> dark
  | "calcite"
  | "diorite"
  | "andesite"
  | "stone"
  | "cobble"
  | "gravel"
  | "stonebrick"
  | "mossycobble"
  | "dripstone"
  | "tuff"
  | "smoothstone"
  | "deepslate"
  | "cobbleddeepslate"
  | "deepslatetiles"
  | "blackstone"
  // ores
  | "coalore"
  | "ironore"
  | "goldore"
  | "lapisore"
  // wood + foliage
  | "log"
  | "leaves"
  | "plank"
  | "beam"
  | "mangrove"
  | "darkbeam"
  | "darkwood"
  // plants (cross-quad)
  | "shortgrass"
  | "tallgrass"
  | "fern"
  | "poppy"
  | "dandelion"
  | "petals"
  | "roots"
  | "vine"
  // castle
  | "plaster"
  | "quartz"
  | "quartzchiseled"
  | "quartzpillar"
  | "whiteclay"
  | "roof"
  | "roofplain"
  | "roofdark"
  | "copper"
  | "coppercut"
  | "greenclay"
  | "ridge"
  | "wool"
  | "window"
  | "gold"
  | "shu"
  | "lantern"
  | "glow"
  // sub-cube variants — the real build's roofs are made of these
  | "roofslab"
  | "roofstair"
  | "ridgeslab"
  | "ridgestair"
  | "quartzslab"
  | "quartzstair"
  | "stonebrickslab"
  | "stonebrickstair";

export type BlockDef = {
  /** Atlas tile [col,row] per face in +X,-X,+Y,-Y,+Z,-Z order. */
  faces: [number, number][];
  /** Cutout (alpha-tested) layer instead of opaque — leaves, plants, bars. */
  cutout?: boolean;
  /** Sways in the wind (foliage); top vertices lean, base stays anchored. */
  foliage?: boolean;
  /** Does not occlude neighbours for AO/culling purposes (like MC glass/leaves). */
  transparent?: boolean;
  /**
   * Rendered as two crossed vertical quads rather than a cube — Minecraft's
   * `cross` model, used by every small plant. Implies cutout + transparent.
   */
  plant?: boolean;
  /**
   * A ground-hugging plant: the cross quads are replaced by a single flat quad
   * just above the floor (pink_petals / moss carpet).
   */
  flat?: boolean;
  /**
   * Sub-cube geometry. Defaults to "cube". Slabs and stairs carry an
   * orientation in the grid's parallel state map — see `shapes.ts`.
   */
  shape?: Shape;
  /**
   * Light emitted, on Minecraft's 0-15 scale. Drives the block-light flood fill
   * that makes the castle glow at night. Vanilla values: sea lantern and
   * glowstone 15, lantern 15, jack o'lantern 15, shroomlight 15, torch 14,
   * campfire 15, redstone lamp 15, end rod 14.
   */
  emission?: number;
};

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

/** A cross-model plant. */
const plant = (
  t: readonly [number, number],
  extra: Partial<BlockDef> = {},
): BlockDef => ({
  faces: all(t),
  plant: true,
  cutout: true,
  transparent: true,
  foliage: true,
  ...extra,
});

export const BLOCKS: Record<BlockId, BlockDef> = {
  // Grass sides are pre-composited at build time (dirt plus a tinted overlay
  // fringe) per MC's grass_block_side + grass_block_side_overlay, so we don't
  // need a second tinted quad at runtime.
  grass: { faces: topBottomSide(TILE.grassTop, TILE.dirt, TILE.grassSide) },
  dirt: { faces: all(TILE.dirt) },
  coarsedirt: { faces: all(TILE.coarseDirt) },
  rooteddirt: { faces: all(TILE.rootedDirt) },
  moss: { faces: all(TILE.moss) },
  mud: { faces: all(TILE.mud) },
  podzol: { faces: topBottomSide(TILE.podzolTop, TILE.dirt, TILE.rootedDirt) },
  mudbrick: { faces: all(TILE.mudBricks) },
  brownclay: { faces: all(TILE.brownTerracotta) },

  calcite: { faces: all(TILE.calcite) },
  diorite: { faces: all(TILE.diorite) },
  andesite: { faces: all(TILE.andesite) },
  stone: { faces: all(TILE.stone) },
  cobble: { faces: all(TILE.cobble) },
  gravel: { faces: all(TILE.gravel) },
  stonebrick: { faces: all(TILE.stonebrick) },
  mossycobble: { faces: all(TILE.mossyCobble) },
  dripstone: { faces: all(TILE.dripstone) },
  tuff: { faces: all(TILE.tuff) },
  deepslate: { faces: column(TILE.tuff, TILE.deepslate) },
  smoothstone: { faces: all(TILE.smoothStone) },
  cobbleddeepslate: { faces: all(TILE.cobbledDeepslate) },
  deepslatetiles: { faces: all(TILE.deepslateTiles) },
  blackstone: { faces: all(TILE.blackstone) },

  coalore: { faces: all(TILE.coalOre) },
  ironore: { faces: all(TILE.ironOre) },
  goldore: { faces: all(TILE.goldOre) },
  lapisore: { faces: all(TILE.lapisOre) },

  log: { faces: column(TILE.logEnd, TILE.logSide) },
  leaves: {
    faces: all(TILE.leaves),
    cutout: true,
    foliage: true,
    transparent: true,
  },
  plank: { faces: all(TILE.plank) },
  beam: { faces: column(TILE.logEnd, TILE.beam) },
  mangrove: { faces: column(TILE.logEnd, TILE.mangroveLog) },
  darkbeam: { faces: column(TILE.logEnd, TILE.strippedDarkOak) },
  darkwood: { faces: column(TILE.logEnd, TILE.darkOakLog) },

  shortgrass: plant(TILE.shortGrass),
  tallgrass: plant(TILE.tallGrassBottom),
  fern: plant(TILE.fern),
  poppy: plant(TILE.poppy),
  dandelion: plant(TILE.dandelion),
  petals: plant(TILE.pinkPetals, { flat: true }),
  roots: plant(TILE.hangingRoots, { foliage: false }),
  vine: plant(TILE.vine, { foliage: true }),

  plaster: { faces: all(TILE.plaster) },
  quartz: { faces: all(TILE.quartz) },
  quartzchiseled: { faces: all(TILE.quartzChiseled) },
  quartzpillar: { faces: column(TILE.quartz, TILE.quartzPillar) },
  whiteclay: { faces: all(TILE.whiteTerracotta) },
  roof: { faces: all(TILE.roof) },
  copper: { faces: all(TILE.copper) },
  coppercut: { faces: all(TILE.copperCut) },
  greenclay: { faces: all(TILE.greenTerracotta) },
  roofplain: { faces: all(TILE.roofPlain) },
  roofdark: { faces: all(TILE.roofDark) },
  ridge: { faces: all(TILE.ridge) },
  wool: { faces: all(TILE.wool) },
  // Iron bars: an alpha-cutout grille, so it must not occlude its neighbours.
  // Emissive at night only — `emission` feeds the night bake and the block-light
  // flood fill, and is ignored by the daylight one, so this lights the storeys
  // from within after dark while leaving the day render untouched.
  window: {
    faces: all(TILE.window),
    cutout: true,
    transparent: true,
    emission: 11,
  },
  gold: { faces: all(TILE.gold) },
  shu: { faces: all(TILE.shu) },
  lantern: { faces: all(TILE.lanternLit), emission: 15 },
  glow: { faces: all(TILE.glow), emission: 15 },

  // Half-block roof geometry. `prismarine_brick_slab` is the most-used material
  // in the reference build, and these are what turn a stepped eave into one that
  // reads as curved.
  roofslab: { faces: all(TILE.roof), shape: "slab" },
  roofstair: { faces: all(TILE.roof), shape: "stair" },
  ridgeslab: { faces: all(TILE.ridge), shape: "slab" },
  ridgestair: { faces: all(TILE.ridge), shape: "stair" },
  quartzslab: { faces: all(TILE.quartz), shape: "slab" },
  quartzstair: { faces: all(TILE.quartz), shape: "stair" },
  stonebrickslab: { faces: all(TILE.stonebrick), shape: "slab" },
  stonebrickstair: { faces: all(TILE.stonebrick), shape: "stair" },
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
 * Minecraft does not AO-shade cross-model plants per corner — every vertex of a
 * plant quad gets the same brightness. Using the flat top-face value keeps them
 * from reading as dark smudges against a lit lawn.
 */
export const PLANT_SHADE = 1.0;

/**
 * 0fps ambient occlusion for a face corner.
 * `side1`/`side2` are the two edge neighbours, `corner` the diagonal one.
 * Returns 0..3 (0 = most occluded).
 */
export function vertexAO(side1: boolean, side2: boolean, corner: boolean): number {
  if (side1 && side2) return 0;
  return 3 - (Number(side1) + Number(side2) + Number(corner));
}
