import * as THREE from "three";
import { PALETTE } from "./palette";
import { mulberry32, randRange } from "./prng";
import type { Tier } from "./quality";

export type IslandOpts = { seed?: number; tier?: Tier };

function std(color: number, roughness: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, flatShading: true });
}

/** Jitter a geometry's vertices radially (x/z) for an organic, non-perfect edge. */
function craggy(geo: THREE.BufferGeometry, rng: () => number, amount: number): void {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r > 0.05) {
      const j = 1 + randRange(rng, -amount, amount);
      pos.setX(i, x * j);
      pos.setZ(i, z * j);
      pos.setY(i, pos.getY(i) + randRange(rng, -amount * 0.4, amount * 0.4));
    }
  }
  geo.computeVertexNormals();
}

/** Floating island: grass cap → soil band → craggy rock spike (top surface at y=0). */
export function createIslandModel(opts: IslandOpts = {}): THREE.Group {
  const rng = mulberry32(opts.seed ?? 5);
  const root = new THREE.Group();
  const topR = 2.6;

  const grassGeo = new THREE.CylinderGeometry(topR, topR * 0.98, 0.42, 14, 1);
  craggy(grassGeo, rng, 0.06);
  const grass = new THREE.Mesh(grassGeo, std(PALETTE.wakaba, 0.9));
  grass.position.y = -0.21;
  root.add(grass);

  const soilGeo = new THREE.CylinderGeometry(topR * 0.98, topR * 0.7, 0.7, 14, 1);
  craggy(soilGeo, rng, 0.08);
  const soil = new THREE.Mesh(soilGeo, std(PALETTE.bark, 0.95));
  soil.position.y = -0.77;
  root.add(soil);

  const rockGeo = new THREE.ConeGeometry(topR * 0.72, 3.0, 12, 4);
  craggy(rockGeo, rng, 0.14);
  const rock = new THREE.Mesh(rockGeo, std(PALETTE.stoneDark, 0.95));
  rock.rotation.x = Math.PI;
  rock.position.y = -1.1 - 1.5;
  root.add(rock);

  // A short stone path on the grass.
  const path = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.02, 1.8),
    std(PALETTE.stone, 0.9),
  );
  path.position.set(0.3, 0.005, 0.4);
  path.rotation.y = 0.3;
  root.add(path);

  root.userData.sculptRuntime = {
    nodes: { grass, soil, rock },
    topRadius: topR,
    sockets: {},
  };
  return root;
}
