import * as THREE from "three";
import { mulberry32, randRange } from "./prng";

/** Soft translucent mist billboards drifting beneath the island. */
export function createMist(count: number): {
  mesh: THREE.Group;
  update: (elapsed: number) => void;
} {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,0.85)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });

  const group = new THREE.Group();
  const rng = mulberry32(31);
  const items: { s: THREE.Sprite; baseX: number; speed: number; phase: number }[] = [];
  for (let i = 0; i < count; i++) {
    const s = new THREE.Sprite(mat);
    const scl = randRange(rng, 1.6, 3.4);
    s.scale.set(scl, scl * 0.55, 1);
    const baseX = randRange(rng, -3.4, 3.4);
    s.position.set(baseX, randRange(rng, -3.4, -1.1), randRange(rng, -3, 2));
    group.add(s);
    items.push({
      s,
      baseX,
      speed: randRange(rng, 0.08, 0.24),
      phase: rng() * Math.PI * 2,
    });
  }

  const update = (elapsed: number) => {
    for (const it of items) {
      it.s.position.x = it.baseX + Math.sin(elapsed * it.speed + it.phase) * 0.7;
    }
  };

  return { mesh: group, update };
}
