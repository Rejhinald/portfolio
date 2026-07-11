import * as THREE from "three";
import { PALETTE } from "./palette";
import { mulberry32, randRange } from "./prng";
import type { Tier } from "./quality";

export type CastleOpts = { seed?: number; tier?: Tier };

function standard(color: number, roughness: number, metalness = 0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading: true });
}

/** One tiered roof: a flared eave frustum + a pyramidal cap, both square-aligned. */
function makeRoof(
  size: number,
  height: number,
  roofMat: THREE.Material,
  goldMat: THREE.Material,
  isTop: boolean,
): THREE.Group {
  const g = new THREE.Group();

  const eaveH = height * 0.3;
  const eave = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.52, size * 0.66, eaveH, 4, 1),
    roofMat,
  );
  eave.rotation.y = Math.PI / 4;
  eave.position.y = eaveH / 2;
  g.add(eave);

  const capH = height * 0.8;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(size * 0.52, capH, 4), roofMat);
  cap.rotation.y = Math.PI / 4;
  cap.position.y = eaveH + capH / 2;
  g.add(cap);

  // Gold ridge trim ring where cap meets eave.
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(size * 0.5, size * 0.012, 6, 4),
    goldMat,
  );
  ring.rotation.x = Math.PI / 2;
  ring.rotation.z = Math.PI / 4;
  ring.position.y = eaveH;
  g.add(ring);

  if (isTop) {
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8),
      goldMat,
    );
    spire.position.y = eaveH + capH + 0.1;
    g.add(spire);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), goldMat);
    orb.position.y = eaveH + capH + 0.23;
    g.add(orb);
    // Golden shachihoko accents partway up the top roof.
    [-1, 1].forEach((s) => {
      const shachi = new THREE.Mesh(
        new THREE.ConeGeometry(0.055, 0.18, 4),
        goldMat,
      );
      shachi.position.set(s * size * 0.2, eaveH + capH * 0.58, 0);
      shachi.rotation.z = s * 0.5;
      g.add(shachi);
    });
  }
  return g;
}

export function createCastleModel(opts: CastleOpts = {}): THREE.Group {
  const rng = mulberry32(opts.seed ?? 7);
  const root = new THREE.Group();
  const nodes: Record<string, THREE.Object3D> = {};

  const stoneMat = standard(PALETTE.stone, 0.95);
  const wallMat = standard(PALETTE.washi, 0.75);
  const roofMat = standard(PALETTE.sumi, 0.65);
  const goldMat = standard(PALETTE.gold, 0.35, 0.65);
  const windowMat = standard(0x2b2f36, 0.5);

  // Sloped stone base (castle batter) — a 4-sided frustum.
  const baseH = 0.55;
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.75, baseH, 4, 1),
    stoneMat,
  );
  base.rotation.y = Math.PI / 4;
  base.position.y = baseH / 2;
  root.add(base);
  nodes.base = base;

  const tiers = [
    { w: 1.72, h: 0.72 },
    { w: 1.36, h: 0.62 },
    { w: 1.0, h: 0.52 },
  ];

  let y = baseH;
  tiers.forEach((t, i) => {
    const tierGroup = new THREE.Group();
    tierGroup.position.y = y;

    const wall = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.w), wallMat);
    wall.position.y = t.h / 2;
    tierGroup.add(wall);

    // Windows: a row of dark insets on the two camera-facing walls.
    const winCount = 3 - Math.max(0, i - 1);
    const winW = t.w / (winCount * 2 + 1);
    for (let f = 0; f < 2; f++) {
      for (let k = 0; k < winCount; k++) {
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(winW, t.h * 0.4, 0.04),
          windowMat,
        );
        const off = (k - (winCount - 1) / 2) * winW * 2;
        win.position.y = t.h * 0.52;
        if (f === 0) {
          win.position.z = t.w / 2 + 0.01;
          win.position.x = off;
        } else {
          win.position.x = t.w / 2 + 0.01;
          win.position.z = off;
          win.rotation.y = Math.PI / 2;
        }
        tierGroup.add(win);
      }
    }

    const roof = makeRoof(t.w * 1.26, t.w * 0.44, roofMat, goldMat, i === tiers.length - 1);
    roof.position.y = t.h + randRange(rng, -0.005, 0.005);
    tierGroup.add(roof);

    root.add(tierGroup);
    nodes[`tier${i}`] = tierGroup;
    y += t.h;
  });

  root.userData.sculptRuntime = {
    nodes,
    pivots: { base: [0, 0, 0] },
    sockets: {},
  };
  return root;
}
