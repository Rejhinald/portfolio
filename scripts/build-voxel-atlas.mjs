/**
 * Build the voxel block atlas from real Minecraft block textures.
 *
 *   node scripts/build-voxel-atlas.mjs [--source vanilla|barebones] [--check]
 *
 * Writes `public/voxel-atlas.png` plus the generated coordinate manifest
 * `lib/voxel/atlas-tiles.ts`. Run it whenever TILES below changes.
 *
 * Why build-time and not runtime: composing ~50 PNGs on a canvas at mount would
 * add work to the hero's critical path and 50 requests to the network. One
 * committed atlas is a single cacheable request, deterministic, and swapping
 * texture packs is just re-running this with a different --source.
 *
 * IMPORTANT (licensing): Mojang's textures and third-party packs like Bare Bones
 * are copyrighted art. Committing the generated atlas redistributes it. The
 * `procedural` source exists so the site can ship generated tiles instead.
 *
 * Three vanilla details this handles, each of which silently corrupts a naive
 * paste:
 *   1. Some textures are ANIMATED vertical strips (prismarine is 16x64 = 4
 *      frames, sea_lantern 16x80 = 5). Only frame 0 may be used.
 *   2. Some are GREYSCALE masks that Minecraft tints per biome at runtime
 *      (grass_block_top, short_grass, fern, oak_leaves...). Pasted raw they
 *      render grey, so the tint is multiplied in here.
 *   3. `grass_block_side` carries a baked plains-green fringe. To retint it,
 *      the greyscale `grass_block_side_overlay` is composited over the side
 *      with our own green.
 */

import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SOURCES = {
  vanilla:
    "C:/Users/Admin/AppData/Local/Temp/claude/c--Users-Admin-Documents-Work-Repo-portfolio/954f8045-8c6a-4b04-a2d5-20ef31660c20/scratchpad/vanilla/assets/minecraft/textures/block",
  barebones:
    "C:/Users/Admin/Downloads/Bare Bones 1.21.11/assets/minecraft/textures/block",
};

const args = process.argv.slice(2);
const sourceName = args.includes("--source")
  ? args[args.indexOf("--source") + 1]
  : "vanilla";
const checkOnly = args.includes("--check");
const SRC = SOURCES[sourceName];
if (!SRC) throw new Error(`unknown --source ${sourceName}`);

export const TILE_PX = 16;
// 16x16 = 256 slots. Power-of-two, and the unused cells are fully
// transparent so they cost almost nothing in the PNG.
const GRID = 16;
const ATLAS_PX = TILE_PX * GRID;

/**
 * Hanami tints for the greyscale masks. Minecraft would use the biome's grass /
 * foliage colour here; we use the site's palette so the island matches the page.
 */
const TINT = {
  grass: [0x9c, 0xb8, 0x72], // wakaba, lifted a little so it reads at distance
  foliage: [0x8f, 0xa8, 0x6b],
  sakura: [0xff, 0xff, 0xff], // cherry textures are already pink — no tint
};

/**
 * The atlas contents. `src` is a vanilla texture name; `tint` multiplies a
 * greyscale mask; `overlay` composites a second (tinted) texture on top;
 * `frame0` crops an animated strip to its first frame.
 *
 * Order defines atlas position (row-major), so appending is safe but reordering
 * invalidates nothing except the generated manifest — which is regenerated here.
 */
const TILES = [
  // ── surface ──
  { key: "grassTop", src: "grass_block_top", tint: TINT.grass },
  {
    key: "grassSide",
    src: "grass_block_side",
    overlay: { src: "grass_block_side_overlay", tint: TINT.grass },
  },
  { key: "dirt", src: "dirt" },
  { key: "coarseDirt", src: "coarse_dirt" },
  { key: "rootedDirt", src: "rooted_dirt" },
  { key: "moss", src: "moss_block" },
  // Brown's real value tiers. The three dirts above measure 110/102/91 with
  // 22-28% internal noise, so they are ONE tier, not three — the ramp was
  // quieter than the blocks' own speckle. These extend brown's range from
  // 1.21x to ~2.0x, and the terracotta is flat (2.6% noise) so its step survives.
  { key: "mud", src: "mud" },
  { key: "podzolTop", src: "podzol_top" },
  { key: "mudBricks", src: "mud_bricks" },
  { key: "brownTerracotta", src: "brown_terracotta" },

  // ── rock, in true measured luminance order (light -> dark) ──
  { key: "calcite", src: "calcite" },
  { key: "diorite", src: "diorite" },
  { key: "smoothStone", src: "smooth_stone" },
  { key: "andesite", src: "andesite" },
  { key: "gravel", src: "gravel" },
  { key: "cobble", src: "cobblestone" },
  { key: "stone", src: "stone" },
  { key: "stonebrick", src: "stone_bricks" },
  { key: "mossyCobble", src: "mossy_cobblestone" },
  { key: "dripstone", src: "dripstone_block" },
  { key: "tuff", src: "tuff" },
  { key: "deepslate", src: "deepslate" },
  { key: "cobbledDeepslate", src: "cobbled_deepslate" },
  { key: "deepslateTiles", src: "deepslate_tiles" },
  { key: "blackstone", src: "blackstone" },

  // ── ores (sparse high-contrast accents) ──
  { key: "coalOre", src: "coal_ore" },
  { key: "ironOre", src: "iron_ore" },
  { key: "goldOre", src: "gold_ore" },
  { key: "lapisOre", src: "lapis_ore" },

  // ── wood ──
  { key: "logSide", src: "cherry_log" },
  { key: "logEnd", src: "cherry_log_top" },
  { key: "plank", src: "spruce_planks" },
  { key: "beam", src: "stripped_spruce_log" },
  // Wood had a hole between 93 and 38 with nothing in it, so the timber never
  // read as a system. These are its middle rungs.
  { key: "mangroveLog", src: "mangrove_log" },
  { key: "strippedDarkOak", src: "stripped_dark_oak_log" },
  { key: "darkOakLog", src: "dark_oak_log" },

  // ── foliage ──
  { key: "leaves", src: "cherry_leaves" },
  { key: "shortGrass", src: "short_grass", tint: TINT.grass },
  { key: "tallGrassTop", src: "tall_grass_top", tint: TINT.grass },
  { key: "tallGrassBottom", src: "tall_grass_bottom", tint: TINT.grass },
  { key: "fern", src: "fern", tint: TINT.grass },
  { key: "poppy", src: "poppy" },
  { key: "dandelion", src: "dandelion" },
  { key: "pinkPetals", src: "pink_petals" },
  { key: "hangingRoots", src: "hanging_roots" },

  // ── castle ──
  { key: "plaster", src: "snow" },
  { key: "quartz", src: "quartz_block_bottom" }, // smooth quartz
  { key: "quartzChiseled", src: "chiseled_quartz_block" },
  { key: "quartzPillar", src: "quartz_pillar" },
  { key: "whiteTerracotta", src: "white_terracotta" },
  { key: "roof", src: "prismarine_bricks" },
  { key: "roofDark", src: "dark_prismarine" },
  { key: "roofPlain", src: "prismarine", frame0: true },
  // Copper gives the roof its actual identity: #52a385 against prismarine's
  // #63ac9e is a clear hue break at nearly the same value.
  { key: "copper", src: "oxidized_copper" },
  { key: "copperCut", src: "oxidized_cut_copper" },
  { key: "greenTerracotta", src: "green_terracotta" },
  { key: "vine", src: "vine", tint: TINT.foliage },
  { key: "ridge", src: "nether_bricks" },
  { key: "wool", src: "black_wool" },
  { key: "gold", src: "gold_block" },
  { key: "window", src: "iron_bars" },
  { key: "shu", src: "red_concrete" },
  { key: "lanternLit", src: "sea_lantern", frame0: true },
  { key: "glow", src: "glowstone" },
  // The actual hanging-lantern and chain textures. `lantern.png` is a 16x48
  // three-frame animation, so it needs the same frame-0 crop as prismarine —
  // these were previously (wrongly) drawing sea_lantern and iron_bars.
  { key: "lantern", src: "lantern", frame0: true },
  { key: "chain", src: "chain" },
];

if (TILES.length > GRID * GRID) {
  throw new Error(`${TILES.length} tiles exceeds the ${GRID}x${GRID} atlas`);
}

/** Load one tile as a 16x16 RGBA buffer, applying frame0 crop + tint. */
async function loadTile(spec) {
  const file = path.join(SRC, `${spec.src}.png`);
  let img = sharp(file).ensureAlpha();
  const meta = await sharp(file).metadata();

  if (meta.height !== meta.width) {
    // Animated strip: take the first frame only.
    if (!spec.frame0) {
      throw new Error(
        `${spec.src} is ${meta.width}x${meta.height} (animated strip) — needs frame0: true`,
      );
    }
    img = sharp(file)
      .ensureAlpha()
      .extract({ left: 0, top: 0, width: meta.width, height: meta.width });
  }

  if (meta.width !== TILE_PX) {
    // Higher-res packs are fine; downscale with nearest to keep it crisp.
    img = img.resize(TILE_PX, TILE_PX, { kernel: "nearest" });
  }

  const { data } = await img.raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.from(data);

  if (spec.tint) {
    for (let i = 0; i < px.length; i += 4) {
      px[i] = (px[i] * spec.tint[0]) / 255;
      px[i + 1] = (px[i + 1] * spec.tint[1]) / 255;
      px[i + 2] = (px[i + 2] * spec.tint[2]) / 255;
    }
  }

  if (spec.overlay) {
    const over = await loadTile(spec.overlay);
    // Straight alpha composite of the tinted overlay onto the base.
    for (let i = 0; i < px.length; i += 4) {
      const a = over[i + 3] / 255;
      if (a === 0) continue;
      px[i] = over[i] * a + px[i] * (1 - a);
      px[i + 1] = over[i + 1] * a + px[i + 1] * (1 - a);
      px[i + 2] = over[i + 2] * a + px[i + 2] * (1 - a);
      px[i + 3] = Math.max(px[i + 3], over[i + 3]);
    }
  }

  return px;
}

async function main() {
  const atlas = Buffer.alloc(ATLAS_PX * ATLAS_PX * 4, 0);
  const coords = [];
  const report = [];

  for (let i = 0; i < TILES.length; i++) {
    const spec = TILES[i];
    const tx = i % GRID;
    const ty = Math.floor(i / GRID);
    const px = await loadTile(spec);

    for (let y = 0; y < TILE_PX; y++) {
      for (let x = 0; x < TILE_PX; x++) {
        const s = (y * TILE_PX + x) * 4;
        const d = ((ty * TILE_PX + y) * ATLAS_PX + (tx * TILE_PX + x)) * 4;
        atlas[d] = px[s];
        atlas[d + 1] = px[s + 1];
        atlas[d + 2] = px[s + 2];
        atlas[d + 3] = px[s + 3];
      }
    }
    coords.push({ key: spec.key, tx, ty });
    report.push(`  ${spec.key.padEnd(20)} <- ${spec.src}  [${tx},${ty}]`);
  }

  console.log(`source: ${sourceName} (${SRC})`);
  console.log(report.join("\n"));
  console.log(`\n${TILES.length} tiles -> ${ATLAS_PX}x${ATLAS_PX} atlas`);

  if (checkOnly) {
    console.log("--check: nothing written");
    return;
  }

  const outPng = path.join(ROOT, "public", "voxel-atlas.png");
  await sharp(atlas, {
    raw: { width: ATLAS_PX, height: ATLAS_PX, channels: 4 },
  })
    .png({ compressionLevel: 9, palette: false })
    .toFile(outPng);
  const { size } = await fs.stat(outPng);
  console.log(`wrote ${path.relative(ROOT, outPng)} (${(size / 1024).toFixed(1)} KB)`);

  const ts = `// GENERATED by scripts/build-voxel-atlas.mjs — do not edit by hand.
// Source pack: ${sourceName}

/** Tile size in px (Minecraft's native block texture resolution). */
export const TILE_PX = ${TILE_PX};
/** Atlas is a ${GRID}x${GRID} grid of tiles. */
export const ATLAS_TILES = ${GRID};
export const ATLAS_PX = ${ATLAS_PX};

/** Atlas tile coordinates, [col, row]. */
export const TILE = {
${coords.map((c) => `  ${c.key}: [${c.tx}, ${c.ty}],`).join("\n")}
} as const satisfies Record<string, readonly [number, number]>;

export type TileName = keyof typeof TILE;
`;
  const outTs = path.join(ROOT, "lib", "voxel", "atlas-tiles.ts");
  await fs.writeFile(outTs, ts, "utf8");
  console.log(`wrote ${path.relative(ROOT, outTs)}`);
}

await main();
