/** Hanami palette shared by the diorama factories (hex ints for three.js). */
export const PALETTE = {
  sora: 0x7fa9c9,
  soraDeep: 0x3e6e8e,
  washi: 0xf3eee6,
  sumi: 0x20242a,
  shu: 0xd9432c,
  gold: 0xc2a05b,
  sakura: 0xe8a0b4,
  sakuraLight: 0xf4cdd6,
  sakuraDeep: 0xc97a93,
  wakaba: 0x8fa86b,
  wakabaDeep: 0x5c7a4f,
  stone: 0x8c9a97,
  stoneDark: 0x6b736f,
  bark: 0x5c4a3a,
  // Osaka-castle copper-patina roofs + dark wall banding
  roofGreen: 0x7aa892,
  roofGreenDark: 0x557a68,
  wallDark: 0x3a3f47,
} as const;

export type Palette = typeof PALETTE;

/**
 * 夜桜 night palette for the diorama, matching the CSS `[data-theme="dark"]`
 * tokens so the scene and the page dissolve into each other at the same colour.
 */
export const NIGHT = {
  /** Sky / fog. */
  sky: 0x21374f,
  skyDeep: 0x121d2b,
  /** The page background the island's underside fades into. */
  page: 0x14181e,
  /** Warm lamplight, used for the block-light tint and the sun stand-in. */
  lamp: 0xffc978,
  /** Cool moonlight fill. */
  moon: 0x8fa8c8,
} as const;
