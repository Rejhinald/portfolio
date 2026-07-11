import * as THREE from "three";
import { PALETTE } from "./palette";
import { mulberry32, randRange } from "./prng";
import type { Tier } from "./quality";

export type SakuraOpts = { seed?: number; tier?: Tier };

function barkMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: PALETTE.bark,
    roughness: 0.92,
    metalness: 0,
    flatShading: true,
  });
}

/** A tapered cylinder segment spanning a → b. */
function segment(
  a: THREE.Vector3,
  b: THREE.Vector3,
  rBot: number,
  rTop: number,
  mat: THREE.Material,
): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBot, len, 6, 1),
    mat,
  );
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize(),
  );
  return mesh;
}

function blossomCountFor(tier: Tier): number {
  return tier === "reduced" ? 200 : tier === "static" ? 300 : 380;
}

export function createSakuraTreeModel(opts: SakuraOpts = {}): THREE.Group {
  const rng = mulberry32(opts.seed ?? 11);
  const tier = opts.tier ?? "full";
  const root = new THREE.Group();
  const branches = new THREE.Group();
  root.add(branches);

  const bark = barkMaterial();
  const anchors: THREE.Vector3[] = [];

  const grow = (
    a: THREE.Vector3,
    dir: THREE.Vector3,
    len: number,
    rad: number,
    depth: number,
  ): void => {
    const b = a.clone().addScaledVector(dir, len);
    branches.add(segment(a, b, rad, rad * 0.68, bark));
    if (depth === 0) {
      anchors.push(b);
      return;
    }
    const n = depth >= 2 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const axis = new THREE.Vector3(
        randRange(rng, -1, 1),
        randRange(rng, 0.1, 0.6),
        randRange(rng, -1, 1),
      ).normalize();
      const nd = dir
        .clone()
        .applyAxisAngle(axis, randRange(rng, 0.45, 0.95))
        .normalize();
      nd.y = Math.max(nd.y, 0.16);
      nd.normalize();
      grow(b, nd, len * randRange(rng, 0.62, 0.78), rad * 0.66, depth - 1);
    }
    if (depth <= 1) anchors.push(b);
  };

  grow(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(randRange(rng, -0.12, 0.12), 1, randRange(rng, -0.12, 0.12)).normalize(),
    1.15,
    0.15,
    3,
  );

  if (anchors.length === 0) anchors.push(new THREE.Vector3(0, 1.2, 0));

  // Instanced blossom canopy clustered around branch-tip anchors.
  const count = blossomCountFor(tier);
  const blossomGeo = new THREE.IcosahedronGeometry(0.12, 0);
  // Per-instance color comes from setColorAt (InstancedMesh.instanceColor),
  // which multiplies the material's white base — do NOT set vertexColors.
  const blossomMat = new THREE.MeshStandardMaterial({
    roughness: 0.85,
    metalness: 0,
    flatShading: true,
  });
  const mesh = new THREE.InstancedMesh(blossomGeo, blossomMat, count);
  mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  const shades = [PALETTE.sakura, PALETTE.sakuraLight, PALETTE.sakuraDeep];
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const anchor = anchors[Math.floor(rng() * anchors.length)];
    dummy.position.set(
      anchor.x + randRange(rng, -0.34, 0.34),
      anchor.y + randRange(rng, -0.22, 0.32),
      anchor.z + randRange(rng, -0.34, 0.34),
    );
    dummy.scale.setScalar(randRange(rng, 0.6, 1.25));
    dummy.rotation.set(rng() * 6.28, rng() * 6.28, rng() * 6.28);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    col.setHex(shades[Math.floor(rng() * shades.length)]);
    mesh.setColorAt(i, col);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  root.add(mesh);

  root.userData.sculptRuntime = {
    nodes: { trunk: branches, canopy: mesh },
    sockets: anchors.map((a) => a.toArray()),
  };
  return root;
}
