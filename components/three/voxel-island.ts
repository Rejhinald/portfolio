import * as THREE from "three";
import { mulberry32 } from "@/lib/three/prng";
import { PALETTE } from "@/lib/three/palette";
import { loadAtlas } from "@/lib/voxel/atlas";
import { VoxelGrid } from "@/lib/voxel/grid";
import { meshGrid } from "@/lib/voxel/mesher";
import { createVoxelMaterial } from "@/lib/voxel/material";
import { paintLight } from "@/lib/voxel/light";
import { buildIsland } from "@/lib/voxel/models/island";
import { buildCastle } from "@/lib/voxel/models/castle";
import { buildSakuraTree } from "@/lib/voxel/models/tree";
import { buildTorii } from "@/lib/voxel/models/dressing";
import { buildGroundCover } from "@/lib/voxel/models/groundcover";
import type { Tier } from "@/lib/three/quality";

export type VoxelIslandOpts = {
  seed?: number;
  tier?: Tier;
  /** Shared time uniform driving foliage sway. */
  time: { value: number };
};

export type VoxelIsland = {
  group: THREE.Group;
  /** Diagnostics for verification (draw calls / triangle budget / build cost). */
  stats: {
    blocks: number;
    faces: number;
    triangles: number;
    /** Ground-cover plants placed by the bonemeal pass. */
    plants: number;
    /** Wall-clock ms to author + light + mesh the grid, one time at mount. */
    buildMs: number;
  };
  dispose: () => void;
};

/**
 * Assemble the whole diorama as voxels: terrain, castle, sakura tree, torii and
 * lantern all authored on ONE shared grid in integer block coordinates, then
 * meshed into (at most) two merged geometries — opaque and alpha-cutout.
 *
 * Objects are named so the Three.js DevTools MCP scene tree is readable.
 */
export function createVoxelIsland(opts: VoxelIslandOpts): VoxelIsland {
  const rng = mulberry32(opts.seed ?? 20260726);
  const animate = opts.tier !== "static";

  const t0 = performance.now();
  const grid = new VoxelGrid();
  buildIsland(grid, rng);
  buildCastle(grid, 0, 0, rng);
  buildSakuraTree(grid, -22, 8, rng);
  buildTorii(grid, 0, 24);

  // Bonemeal pass — last, so it can see the finished surface and skip the paved
  // approach and anything already standing on the grass.
  const plantCount = buildGroundCover(grid, rng, 30, {
    density: opts.tier === "static" ? 0.7 : opts.tier === "reduced" ? 0.55 : 1,
    keepClear: (x, z) => Math.abs(x) <= 2 && z > 14, // the approach + gate mouth
  });

  // Paint light before meshing: shading is baked into vertex colours, so the
  // eave shadows and grounded base have to exist on the grid first.
  // minSky is deliberately mild: every storey sits under its own 3-block eave,
  // so an aggressive floor crushed the white plaster walls to grey. The eave
  // shadow still reads, it just no longer eats the building's local colour.
  paintLight(grid, {
    yDark: -18,
    yLit: 4,
    reach: 7,
    minSky: 0.74,
    minGravity: 0.62,
  });

  const { opaque, cutout, plants, faceCount } = meshGrid(grid);
  const buildMs = performance.now() - t0;

  const atlas = loadAtlas();
  const hazeColor = new THREE.Color(PALETTE.washi);
  // Local-space Y where the underside starts dissolving into the page.
  const shared = {
    atlas,
    time: opts.time,
    hazeColor,
    // Local Y, i.e. block index * BLOCK. Confined to the last few courses of
    // the spike (blocks ~-17 to -22) so the rock stays solid rock until then.
    hazeTop: -1.95,
    hazeBottom: -2.55,
    windAmp: animate ? 1 : 0,
  };

  const group = new THREE.Group();
  group.name = "voxel-island";

  // NOTE: the atlas is deliberately absent — `loadAtlas` returns one shared,
  // cached texture, so disposing it here would blank the scene on remount.
  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  if (opaque) {
    const mat = createVoxelMaterial({ ...shared });
    const mesh = new THREE.Mesh(opaque, mat);
    mesh.name = "voxel-terrain-opaque";
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    disposables.push(opaque, mat);
  }

  if (cutout) {
    const mat = createVoxelMaterial({ ...shared, cutout: true });
    const mesh = new THREE.Mesh(cutout, mat);
    mesh.name = "voxel-foliage-cutout";
    mesh.castShadow = true;
    mesh.receiveShadow = false; // leaves self-shadowing reads as noise
    group.add(mesh);
    disposables.push(cutout, mat);
  }

  if (plants) {
    const mat = createVoxelMaterial({ ...shared, cutout: true, doubleSide: true });
    const mesh = new THREE.Mesh(plants, mat);
    mesh.name = "voxel-ground-cover";
    // Ground cover neither casts nor receives: a lawn of tiny shadow casters is
    // pure cost, and self-shadowed grass reads as dirt.
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    group.add(mesh);
    disposables.push(plants, mat);
  }

  return {
    group,
    stats: {
      blocks: grid.size,
      faces: faceCount,
      triangles: faceCount * 2,
      plants: plantCount,
      buildMs,
    },
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}
