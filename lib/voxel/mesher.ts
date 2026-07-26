import * as THREE from "three";
import {
  AO_SHADE,
  BLOCK,
  BLOCKS,
  FACE_SHADE,
  PLANT_SHADE,
  vertexAO,
  type BlockId,
} from "./blocks";
import { tileUV } from "./atlas";
import { shapeBoxes, type Box } from "./shapes";
import type { VoxelGrid } from "./grid";

/**
 * Face table in BoxGeometry order: +X,-X,+Y,-Y,+Z,-Z.
 * For each face: the outward normal, and the two in-plane axes (u,v) used to
 * walk the four corners and to sample AO neighbours.
 */
const FACES: {
  n: [number, number, number];
  u: [number, number, number];
  v: [number, number, number];
}[] = [
  { n: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] }, // +X
  { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] }, // -X
  { n: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] }, // +Y
  { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] }, // -Y
  { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] }, // +Z
  { n: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] }, // -Z
];

/** Corner walk order, matching cornerAO: (-u,-v), (+u,-v), (-u,+v), (+u,+v). */
const CORNERS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
] as const;

type Buffers = {
  pos: number[];
  norm: number[];
  uv: number[];
  col: number[];
  /** Night colour, blended toward by a uniform — see `nightColour`. */
  night: number[];
  sway: number[];
  idx: number[];
};

const newBuffers = (): Buffers => ({
  pos: [],
  norm: [],
  uv: [],
  col: [],
  night: [],
  sway: [],
  idx: [],
});

/**
 * Night vertex colour for one face.
 *
 * Baking BOTH a day and a night colour, and cross-fading between them with a
 * uniform, is what makes the theme toggle free: re-meshing to change lighting
 * would cost ~140ms and stall the toggle.
 *
 * Night is not just "day, darker". Sky light goes cool and very low, while block
 * light is warm, so an unlit wall reads blue-grey and a lantern-lit one reads
 * amber. Emitters ignore shading entirely — a sea lantern's own faces stay at
 * full brightness however occluded they are, which is what makes them read as
 * the light source rather than as pale blocks.
 */
function nightColour(
  ao: number,
  faceShade: number,
  painted: number,
  light: number,
  emission: number,
): [number, number, number] {
  if (emission > 0) return [1, 1, 1];

  // Moonlight: cool, dim, and still shaped by AO so form survives.
  const sky = 0.2 * ao * faceShade * painted;
  const moon: [number, number, number] = [sky * 0.82, sky * 0.9, sky * 1.15];

  // Block light: 0-15 raised to a curve so the falloff reads like lamplight
  // rather than a linear ramp, then tinted amber.
  const l = Math.pow(light / 15, 1.45);
  const lit = l * 1.05 * faceShade;
  return [
    Math.min(1, moon[0] + lit * 1.0),
    Math.min(1, moon[1] + lit * 0.74),
    Math.min(1, moon[2] + lit * 0.42),
  ];
}

/**
 * Project a block-local point onto a face's texture axes, giving fractions in
 * [0,1] of the tile.
 *
 * Minecraft locks textures to block space rather than stretching them across a
 * partial face, so a stair's step shows the middle of its tile instead of a
 * squashed copy of the whole thing. Doing the same here is what stops slabs
 * looking like separate, differently-scaled materials.
 */
function faceFrac(
  axis: [number, number, number],
  lx: number,
  ly: number,
  lz: number,
): number {
  if (axis[0] !== 0) return axis[0] > 0 ? lx : 1 - lx;
  if (axis[1] !== 0) return axis[1] > 0 ? ly : 1 - ly;
  return axis[2] > 0 ? lz : 1 - lz;
}

/**
 * Ambient occlusion for the four corners of one face, using the 0fps
 * side1/side2/corner rule. Sampling happens in the plane of the block in
 * front of the face (pos + normal), exactly like Minecraft.
 */
function cornerAO(
  grid: VoxelGrid,
  x: number,
  y: number,
  z: number,
  f: number,
): [number, number, number, number] {
  const { n, u, v } = FACES[f];
  const ax = x + n[0];
  const ay = y + n[1];
  const az = z + n[2];
  const at = (du: number, dv: number) =>
    grid.isSolid(
      ax + u[0] * du + v[0] * dv,
      ay + u[1] * du + v[1] * dv,
      az + u[2] * du + v[2] * dv,
    );

  const out: number[] = [];
  for (const [su, sv] of CORNERS) {
    out.push(vertexAO(at(su, 0), at(0, sv), at(su, sv)));
  }
  return out as [number, number, number, number];
}

/** Deterministic per-cell hash in [0,1), for plant jitter. */
function hash3(x: number, y: number, z: number): number {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Emit one face of one box. `boundary` drives culling and AO. */
function emitBoxFace(
  b: Buffers,
  grid: VoxelGrid,
  x: number,
  y: number,
  z: number,
  f: number,
  box: Box,
  id: BlockId,
  shade: number,
) {
  const { n, u, v } = FACES[f];
  const def = BLOCKS[id];
  const [tx, ty] = def.faces[f];
  const [a0, c0, a1, c1] = tileUV(tx, ty);

  // The face sits at the box's extreme along the normal axis.
  const lo: [number, number, number] = [box[0], box[1], box[2]];
  const hi: [number, number, number] = [box[3], box[4], box[5]];
  const axis = n[0] !== 0 ? 0 : n[1] !== 0 ? 1 : 2;
  const plane = n[axis] > 0 ? hi[axis] : lo[axis];
  const boundary = n[axis] > 0 ? plane === 1 : plane === 0;

  // Unoccluded inside the cube; only a boundary face can see a neighbour.
  const ao: [number, number, number, number] = boundary
    ? cornerAO(grid, x, y, z, f)
    : [3, 3, 3, 3];

  const base = b.pos.length / 3;
  const swayTop = def.foliage ? 1 : 0;

  for (let i = 0; i < 4; i++) {
    const [su, sv] = CORNERS[i];
    // Block-local corner: fixed on the normal axis, at a box extreme on u and v.
    const l: [number, number, number] = [0, 0, 0];
    l[axis] = plane;
    for (const ax2 of [0, 1, 2]) {
      if (ax2 === axis) continue;
      const along = u[ax2] !== 0 ? u[ax2] * su : v[ax2] * sv;
      l[ax2] = along > 0 ? hi[ax2] : lo[ax2];
    }

    b.pos.push(
      (x - 0.5 + l[0]) * BLOCK,
      (y - 0.5 + l[1]) * BLOCK,
      (z - 0.5 + l[2]) * BLOCK,
    );
    b.norm.push(n[0], n[1], n[2]);

    const tu = faceFrac(u, l[0], l[1], l[2]);
    const tv = faceFrac(v, l[0], l[1], l[2]);
    b.uv.push(a0 + (a1 - a0) * tu, c0 + (c1 - c0) * tv);

    const lum = AO_SHADE[ao[i]] * shade;
    b.col.push(lum, lum, lum);
    const [nr, ng, nb] = nightColour(
      AO_SHADE[ao[i]],
      FACE_SHADE[f],
      grid.getShade(x, y, z),
      grid.getLight(x, y, z),
      def.emission ?? 0,
    );
    b.night.push(nr, ng, nb);
    b.sway.push(swayTop && l[1] > 0.5 ? 1 : swayTop * 0.35);
  }

  // 0fps anisotropy fix: flip the diagonal so it faces the darkest corner,
  // otherwise unequal AO interpolation leaves a visible seam (MC-138211).
  const flip = ao[0] + ao[3] > ao[1] + ao[2];
  if (flip) {
    b.idx.push(base + 1, base + 3, base + 2, base + 1, base + 2, base + 0);
  } else {
    b.idx.push(base + 0, base + 1, base + 3, base + 0, base + 3, base + 2);
  }
}

/**
 * A cross-model plant: two vertical quads on the diagonals, as Minecraft draws
 * grass and flowers. Rendered DoubleSide, so one quad per plane suffices.
 *
 * Vanilla jitters plants up to a quarter block horizontally, which is what stops
 * a scattered lawn looking like it was placed on a grid.
 */
function emitPlant(
  b: Buffers,
  grid: VoxelGrid,
  x: number,
  y: number,
  z: number,
  id: BlockId,
) {
  const def = BLOCKS[id];
  // Ground cover picks up lantern light like anything else, so a lit courtyard
  // has warm grass rather than a dark lawn under a bright lamp.
  const nightPlant = nightColour(1, 1, 1, grid.getLight(x, y, z), 0);
  const [tx, ty] = def.faces[0];
  const [a0, c0, a1, c1] = tileUV(tx, ty);

  const jx = (hash3(x, y, z) - 0.5) * 0.5;
  const jz = (hash3(z, x, y) - 0.5) * 0.5;
  const ox = (x + jx) * BLOCK;
  const oz = (z + jz) * BLOCK;
  const h = BLOCK * 0.5;

  /** One quad: p0->p1 along the ground, rising by `height`. */
  const quad = (
    x0: number,
    z0: number,
    x1: number,
    z1: number,
    y0: number,
    y1: number,
  ) => {
    const base = b.pos.length / 3;
    const pts: [number, number, number][] = [
      [x0, y0, z0],
      [x1, y0, z1],
      [x0, y1, z0],
      [x1, y1, z1],
    ];
    const uvs: [number, number][] = [
      [a0, c0],
      [a1, c0],
      [a0, c1],
      [a1, c1],
    ];
    // Flat shade, no AO: vanilla gives every vertex of a plant the same
    // brightness, and corner-shading them reads as dark smudges on a lit lawn.
    for (let i = 0; i < 4; i++) {
      b.pos.push(pts[i][0], pts[i][1], pts[i][2]);
      b.norm.push(0, 1, 0);
      b.uv.push(uvs[i][0], uvs[i][1]);
      b.col.push(PLANT_SHADE, PLANT_SHADE, PLANT_SHADE);
      b.night.push(nightPlant[0], nightPlant[1], nightPlant[2]);
      b.sway.push(i >= 2 ? 1 : 0); // only the top edge leans
    }
    b.idx.push(base, base + 1, base + 3, base, base + 3, base + 2);
  };

  const yb = (y - 0.5) * BLOCK;
  if (def.flat) {
    // Ground-hugging (pink petals): one horizontal quad just off the floor.
    const yf = yb + BLOCK * 0.06;
    const base = b.pos.length / 3;
    const pts: [number, number, number][] = [
      [ox - h, yf, oz - h],
      [ox + h, yf, oz - h],
      [ox - h, yf, oz + h],
      [ox + h, yf, oz + h],
    ];
    const uvs: [number, number][] = [
      [a0, c0],
      [a1, c0],
      [a0, c1],
      [a1, c1],
    ];
    for (let i = 0; i < 4; i++) {
      b.pos.push(pts[i][0], pts[i][1], pts[i][2]);
      b.norm.push(0, 1, 0);
      b.uv.push(uvs[i][0], uvs[i][1]);
      b.col.push(PLANT_SHADE, PLANT_SHADE, PLANT_SHADE);
      b.night.push(nightPlant[0], nightPlant[1], nightPlant[2]);
      b.sway.push(0);
    }
    b.idx.push(base, base + 1, base + 3, base, base + 3, base + 2);
    return;
  }

  const yt = yb + BLOCK;
  quad(ox - h, oz - h, ox + h, oz + h, yb, yt);
  quad(ox + h, oz - h, ox - h, oz + h, yb, yt);
}

function toGeometry(b: Buffers): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(b.pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(b.norm, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2));
  g.setAttribute("color", new THREE.Float32BufferAttribute(b.col, 3));
  g.setAttribute("aNight", new THREE.Float32BufferAttribute(b.night, 3));
  g.setAttribute("aSway", new THREE.Float32BufferAttribute(b.sway, 1));
  g.setIndex(b.idx);
  g.computeBoundingSphere();
  return g;
}

export type MeshResult = {
  opaque: THREE.BufferGeometry | null;
  cutout: THREE.BufferGeometry | null;
  /** Cross-model plants — needs a DoubleSide material. */
  plants: THREE.BufferGeometry | null;
  /** Faces actually emitted (diagnostics). */
  faceCount: number;
};

/**
 * Convert a voxel grid into merged geometries: opaque, alpha-cutout, and plants.
 * Interior faces are culled, so a packed volume emits only its shell — the thing
 * InstancedMesh structurally cannot do. AO and per-face brightness are baked into
 * vertex colours, so no per-block lighting work happens at runtime.
 */
export function meshGrid(grid: VoxelGrid): MeshResult {
  const op = newBuffers();
  const ct = newBuffers();
  const pl = newBuffers();
  let faceCount = 0;

  for (const [x, y, z, id] of grid.entries()) {
    const def = BLOCKS[id];

    if (def.plant) {
      emitPlant(pl, grid, x, y, z, id);
      faceCount += def.flat ? 1 : 2;
      continue;
    }

    const b = def.cutout ? ct : op;
    const shape = def.shape ?? "cube";
    const boxes = shapeBoxes(shape, shape === "cube" ? 0 : grid.getState(x, y, z));

    for (const box of boxes) {
      for (let f = 0; f < 6; f++) {
        const { n } = FACES[f];
        const axis = n[0] !== 0 ? 0 : n[1] !== 0 ? 1 : 2;
        const plane = n[axis] > 0 ? box[axis + 3] : box[axis];
        const boundary = n[axis] > 0 ? plane === 1 : plane === 0;

        if (boundary) {
          const nx = x + n[0];
          const ny = y + n[1];
          const nz = z + n[2];
          // Only a full cube may hide a face. Also cull where identical
          // neighbours meet, which removes most of a slab run's interior.
          if (grid.isFullOpaque(nx, ny, nz)) continue;
          if (
            grid.get(nx, ny, nz) === id &&
            (shape === "cube" || grid.getState(nx, ny, nz) === grid.getState(x, y, z))
          ) {
            continue;
          }
        }
        emitBoxFace(b, grid, x, y, z, f, box, id, FACE_SHADE[f] * grid.getShade(x, y, z));
        faceCount++;
      }
    }
  }

  return {
    opaque: op.pos.length ? toGeometry(op) : null,
    cutout: ct.pos.length ? toGeometry(ct) : null,
    plants: pl.pos.length ? toGeometry(pl) : null,
    faceCount,
  };
}
