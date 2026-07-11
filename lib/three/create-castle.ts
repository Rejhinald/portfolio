import * as THREE from "three";
import { PALETTE } from "./palette";
import { mulberry32, randRange } from "./prng";
import { makeSurfaceMaps, applySurface } from "./textures";
import type { Tier } from "./quality";

export type CastleOpts = { seed?: number; tier?: Tier };

function standard(color: number, roughness: number, metalness = 0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading: true });
}

/** A flat triangular gable (chidori-hafu) pointing up, thin in Z, centered. */
function makeGable(w: number, h: number, mat: THREE.Material): THREE.Mesh {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(0, h);
  shape.lineTo(w / 2, 0);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false });
  geo.translate(0, 0, -0.025);
  return new THREE.Mesh(geo, mat);
}

/** One tiered roof: green flared eave + green pyramidal cap, gold ridge + gold gables. */
function makeRoof(
  size: number,
  height: number,
  greenMat: THREE.Material,
  goldMat: THREE.Material,
  isTop: boolean,
): THREE.Group {
  const g = new THREE.Group();

  const eaveH = height * 0.3;
  const eave = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.52, size * 0.68, eaveH, 4, 1),
    greenMat,
  );
  eave.rotation.y = Math.PI / 4;
  eave.position.y = eaveH / 2;
  g.add(eave);

  const capH = height * 0.82;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(size * 0.52, capH, 4), greenMat);
  cap.rotation.y = Math.PI / 4;
  cap.position.y = eaveH + capH / 2;
  g.add(cap);

  // Gold ridge ring where cap meets eave.
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(size * 0.5, size * 0.014, 6, 4),
    goldMat,
  );
  ring.rotation.x = Math.PI / 2;
  ring.rotation.z = Math.PI / 4;
  ring.position.y = eaveH;
  g.add(ring);

  // Gold triangular gables (chidori-hafu) on all four eave faces.
  const gableW = size * 0.5;
  const gableH = height * 0.6;
  for (let f = 0; f < 4; f++) {
    const gable = makeGable(gableW, gableH, goldMat);
    const ang = (f * Math.PI) / 2;
    gable.rotation.y = ang;
    gable.rotation.x = -0.22;
    gable.position.set(
      Math.sin(ang) * size * 0.42,
      eaveH * 0.7,
      Math.cos(ang) * size * 0.42,
    );
    g.add(gable);
  }

  if (isTop) {
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.22, 8),
      goldMat,
    );
    spire.position.y = eaveH + capH + 0.11;
    g.add(spire);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), goldMat);
    orb.position.y = eaveH + capH + 0.24;
    g.add(orb);
    // Golden shachihoko flanking the top of the cap.
    [-1, 1].forEach((s) => {
      const shachi = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.19, 4), goldMat);
      shachi.position.set(s * size * 0.22, eaveH + capH * 0.66, 0);
      shachi.rotation.z = s * 0.55;
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
  const wallMat = standard(PALETTE.washi, 0.72);
  const bandMat = standard(PALETTE.wallDark, 0.7);
  const greenMat = standard(PALETTE.roofGreen, 0.55);
  const goldMat = standard(PALETTE.gold, 0.35, 0.7);
  const windowMat = standard(0x2b2f36, 0.5);

  // Surface texture + normal relief: patina cracks on copper roofs, grit on
  // stone, and horizontal beam lines on the plaster walls.
  const seed = opts.seed ?? 7;
  applySurface(greenMat, makeSurfaceMaps(seed + 3, { cracks: 16, mottle: 0.06, repeat: 2, crackAlpha: 0.4, normalScale: 0.5 }));
  applySurface(stoneMat, makeSurfaceMaps(seed + 5, { cracks: 10, mottle: 0.12, repeat: 2, normalScale: 0.7 }));
  applySurface(wallMat, makeSurfaceMaps(seed + 6, { cracks: 3, mottle: 0.05, repeat: 1, beams: 3, crackAlpha: 0.28, normalScale: 0.4 }));

  // Sloped stone base (batter).
  const baseH = 0.6;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.85, baseH, 4, 1), stoneMat);
  base.rotation.y = Math.PI / 4;
  base.position.y = baseH / 2;
  root.add(base);
  nodes.base = base;

  // Five tapering tiers → a tall tenshu.
  const tiers = [
    { w: 1.82, h: 0.66 },
    { w: 1.55, h: 0.58 },
    { w: 1.28, h: 0.52 },
    { w: 1.02, h: 0.46 },
    { w: 0.78, h: 0.42 },
  ];

  let y = baseH;
  tiers.forEach((t, i) => {
    const tierGroup = new THREE.Group();
    tierGroup.position.y = y;

    const wall = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.w), wallMat);
    wall.position.y = t.h / 2;
    tierGroup.add(wall);

    // Dark wall band at the base of the tier.
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(t.w * 1.005, t.h * 0.26, t.w * 1.005),
      bandMat,
    );
    band.position.y = t.h * 0.13;
    tierGroup.add(band);

    // Windows on the two camera-facing walls.
    const winCount = Math.max(2, 4 - i);
    const winW = t.w / (winCount * 2 + 1);
    for (let f = 0; f < 2; f++) {
      for (let k = 0; k < winCount; k++) {
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(winW, t.h * 0.34, 0.04),
          windowMat,
        );
        const off = (k - (winCount - 1) / 2) * winW * 2;
        win.position.y = t.h * 0.56;
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

    const roof = makeRoof(
      t.w * 1.24,
      t.w * 0.42,
      greenMat,
      goldMat,
      i === tiers.length - 1,
    );
    roof.position.y = t.h + randRange(rng, -0.004, 0.004);
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
