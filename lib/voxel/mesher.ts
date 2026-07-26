import * as THREE from "three";
import {
  AO_SHADE,
  BLOCK,
  BLOCKS,
  FACE_SHADE,
  vertexAO,
  type BlockId,
} from "./blocks";
import { tileUV } from "./atlas";
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

type Buffers = {
  pos: number[];
  norm: number[];
  uv: number[];
  col: number[];
  sway: number[];
  idx: number[];
};

const newBuffers = (): Buffers => ({
  pos: [],
  norm: [],
  uv: [],
  col: [],
  sway: [],
  idx: [],
});

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

  // Corners in (u,v) order: (-,-), (+,-), (-,+), (+,+)
  const out: number[] = [];
  for (const [su, sv] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const) {
    out.push(vertexAO(at(su, 0), at(0, sv), at(su, sv)));
  }
  return out as [number, number, number, number];
}

function emitFace(
  b: Buffers,
  grid: VoxelGrid,
  x: number,
  y: number,
  z: number,
  f: number,
  id: BlockId,
) {
  const { n, u, v } = FACES[f];
  const def = BLOCKS[id];
  const [tx, ty] = def.faces[f];
  const [u0, v0, u1, v1] = tileUV(tx, ty);

  // Face centre in world units (block centres sit on integer * BLOCK).
  const cx = (x + n[0] * 0.5) * BLOCK;
  const cy = (y + n[1] * 0.5) * BLOCK;
  const cz = (z + n[2] * 0.5) * BLOCK;
  const h = BLOCK * 0.5;

  const ao = cornerAO(grid, x, y, z, f);
  // Painted light (light.ts) multiplies into vanilla's face brightness.
  const shade = FACE_SHADE[f] * grid.getShade(x, y, z);
  const base = b.pos.length / 3;

  // Corner order matches cornerAO: (-u,-v), (+u,-v), (-u,+v), (+u,+v)
  const corners: [number, number][] = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  const uvs: [number, number][] = [
    [u0, v0],
    [u1, v0],
    [u0, v1],
    [u1, v1],
  ];

  // Foliage sways only at its top vertices, so trunks/edges stay anchored.
  const swayTop = def.foliage ? 1 : 0;

  corners.forEach(([su, sv], i) => {
    b.pos.push(
      cx + (u[0] * su + v[0] * sv) * h,
      cy + (u[1] * su + v[1] * sv) * h,
      cz + (u[2] * su + v[2] * sv) * h,
    );
    b.norm.push(n[0], n[1], n[2]);
    b.uv.push(uvs[i][0], uvs[i][1]);
    const l = AO_SHADE[ao[i]] * shade;
    b.col.push(l, l, l);
    // Top-vertex test: this corner's world Y is above the block centre.
    const vy = cy + (u[1] * su + v[1] * sv) * h;
    b.sway.push(swayTop && vy >= cy - 1e-6 ? 1 : swayTop * 0.35);
  });

  // 0fps anisotropy fix: flip the diagonal so it faces the darkest corner,
  // otherwise unequal AO interpolation leaves a visible seam (MC-138211).
  const flip = ao[0] + ao[3] > ao[1] + ao[2];
  if (flip) {
    b.idx.push(base + 1, base + 3, base + 2, base + 1, base + 2, base + 0);
  } else {
    b.idx.push(base + 0, base + 1, base + 3, base + 0, base + 3, base + 2);
  }
}

function toGeometry(b: Buffers): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(b.pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(b.norm, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2));
  g.setAttribute("color", new THREE.Float32BufferAttribute(b.col, 3));
  g.setAttribute("aSway", new THREE.Float32BufferAttribute(b.sway, 1));
  g.setIndex(b.idx);
  g.computeBoundingSphere();
  return g;
}

export type MeshResult = {
  opaque: THREE.BufferGeometry | null;
  cutout: THREE.BufferGeometry | null;
  /** Faces actually emitted (diagnostics). */
  faceCount: number;
};

/**
 * Convert a voxel grid into at most two merged geometries (opaque + cutout).
 * Interior faces are culled, so a packed volume emits only its shell — the
 * thing InstancedMesh structurally cannot do. AO and per-face brightness are
 * baked into vertex colours, so no per-block lighting work happens at runtime.
 */
export function meshGrid(grid: VoxelGrid): MeshResult {
  const op = newBuffers();
  const ct = newBuffers();
  let faceCount = 0;

  for (const [x, y, z, id] of grid.entries()) {
    const def = BLOCKS[id];
    const b = def.cutout ? ct : op;

    for (let f = 0; f < 6; f++) {
      const { n } = FACES[f];
      const nx = x + n[0];
      const ny = y + n[1];
      const nz = z + n[2];
      // Cull faces hidden by an opaque neighbour. Cutout blocks also cull
      // against their own kind so a leaf mass isn't a soup of interior quads.
      if (grid.isSolid(nx, ny, nz)) continue;
      if (def.cutout && grid.get(nx, ny, nz) === id) continue;
      emitFace(b, grid, x, y, z, f, id);
      faceCount++;
    }
  }

  return {
    opaque: op.pos.length ? toGeometry(op) : null,
    cutout: ct.pos.length ? toGeometry(ct) : null,
    faceCount,
  };
}
