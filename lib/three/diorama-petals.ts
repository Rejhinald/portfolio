import * as THREE from "three";
import { PALETTE } from "./palette";
import { mulberry32, randRange } from "./prng";

function makePetalGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.11, 0.09, 0.13, 0.3, 0, 0.42);
  shape.bezierCurveTo(-0.13, 0.3, -0.11, 0.09, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 6);
  geo.center();
  return geo;
}

type Petal = {
  seedX: number;
  z: number;
  offsetY: number;
  fall: number;
  swayAmp: number;
  swaySpeed: number;
  swayPhase: number;
  rotSpeed: number;
  rotX: number;
  rotY: number;
  scale: number;
};

/** Drifting sakura petals scoped to the diorama volume. */
export function createPetalField(count: number): {
  mesh: THREE.InstancedMesh;
  update: (elapsed: number) => void;
} {
  const rng = mulberry32(23);
  const geo = makePetalGeometry();
  const mat = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
  });
  const n = Math.max(count, 1);
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;

  const SPAN_X = 6;
  const TOP_Y = 5;
  const RANGE_Y = 9;
  const shades = [PALETTE.sakura, PALETTE.sakuraLight, 0xffffff];
  const col = new THREE.Color();
  const petals: Petal[] = [];
  for (let i = 0; i < n; i++) {
    petals.push({
      seedX: randRange(rng, -SPAN_X, SPAN_X),
      z: randRange(rng, -4, 3),
      offsetY: rng() * RANGE_Y,
      fall: randRange(rng, 0.4, 0.9),
      swayAmp: randRange(rng, 0.3, 0.85),
      swaySpeed: randRange(rng, 0.4, 0.9),
      swayPhase: rng() * Math.PI * 2,
      rotSpeed: randRange(rng, 0.4, 1.1),
      rotX: rng() * Math.PI,
      rotY: rng() * Math.PI,
      scale: randRange(rng, 0.32, 0.66),
    });
    col.setHex(shades[i % shades.length]);
    mesh.setColorAt(i, col);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  const dummy = new THREE.Object3D();
  const update = (elapsed: number) => {
    for (let i = 0; i < n; i++) {
      const p = petals[i];
      const y = TOP_Y - ((elapsed * p.fall + p.offsetY) % RANGE_Y);
      const x = p.seedX + Math.sin(elapsed * p.swaySpeed + p.swayPhase) * p.swayAmp;
      dummy.position.set(x, y, p.z);
      dummy.rotation.set(
        p.rotX + elapsed * p.rotSpeed * 0.5,
        p.rotY + elapsed * p.rotSpeed,
        elapsed * p.rotSpeed * 0.7,
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
  update(0);

  return { mesh, update };
}
