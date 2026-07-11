import * as THREE from "three";
import { mulberry32 } from "./prng";

type DetailOpts = {
  cracks?: number;
  mottle?: number;
  repeat?: number;
  crackAlpha?: number;
  beams?: number;
  normalScale?: number;
};

/** Draws the shared grayscale detail field (mottle blotches + branching cracks + optional beams). */
function drawDetailCanvas(rng: () => number, S: number, opts: DetailOpts): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(0, 0, S, S);

  const mottle = opts.mottle ?? 0.1;
  for (let i = 0; i < 90; i++) {
    const x = rng() * S;
    const y = rng() * S;
    const r = 3 + rng() * 16;
    const v = Math.round(238 + (rng() * 2 - 1) * mottle * 255);
    ctx.fillStyle = `rgba(${v},${v},${v},0.5)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Horizontal beams (for castle plaster/wood walls).
  if (opts.beams) {
    ctx.strokeStyle = "rgba(90,90,90,0.5)";
    ctx.lineWidth = 2;
    for (let b = 1; b <= opts.beams; b++) {
      const y = (b / (opts.beams + 1)) * S;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(S, y);
      ctx.stroke();
    }
  }

  const cracks = opts.cracks ?? 12;
  const alpha = opts.crackAlpha ?? 0.5;
  ctx.strokeStyle = `rgba(95,95,95,${alpha})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < cracks; i++) {
    let x = rng() * S;
    let y = rng() * S;
    let a = rng() * Math.PI * 2;
    const steps = 6 + Math.floor(rng() * 14);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < steps; s++) {
      a += (rng() * 2 - 1) * 0.9;
      x += Math.cos(a) * 6;
      y += Math.sin(a) * 6;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  return canvas;
}

/** Derive a tangent-space normal map from the grayscale canvas (treated as a heightfield). */
function normalFromCanvas(src: HTMLCanvasElement, S: number, strength: number): THREE.CanvasTexture {
  const data = src.getContext("2d")!.getImageData(0, 0, S, S).data;
  const out = document.createElement("canvas");
  out.width = S;
  out.height = S;
  const octx = out.getContext("2d")!;
  const img = octx.createImageData(S, S);
  const g = (x: number, y: number) =>
    data[(((y + S) % S) * S + ((x + S) % S)) * 4] / 255;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (g(x - 1, y) - g(x + 1, y)) * strength;
      const dy = (g(x, y - 1) - g(x, y + 1)) * strength;
      const len = Math.hypot(dx, dy, 1) || 1;
      const i = (y * S + x) * 4;
      img.data[i] = (dx / len) * 127.5 + 127.5;
      img.data[i + 1] = (dy / len) * 127.5 + 127.5;
      img.data[i + 2] = (1 / len) * 127.5 + 127.5;
      img.data[i + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(out);
}

/**
 * Procedural albedo + normal maps from one shared crack/mottle field, so
 * surfaces read as textured (cracks catch light) instead of flat-poly.
 */
export function makeSurfaceMaps(
  seed: number,
  opts: DetailOpts = {},
): { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture; normalScale: number } {
  const rng = mulberry32(seed);
  const S = 128;
  const canvas = drawDetailCanvas(rng, S, opts);
  const rep = opts.repeat ?? 3;

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(rep, rep);
  map.anisotropy = 4;

  const normalMap = normalFromCanvas(canvas, S, 2.2);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(rep, rep);

  return { map, normalMap, normalScale: opts.normalScale ?? 0.6 };
}

/** Apply the map/normalMap pair to a standard material. */
export function applySurface(
  mat: THREE.MeshStandardMaterial,
  maps: { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture; normalScale: number },
): void {
  mat.map = maps.map;
  mat.normalMap = maps.normalMap;
  mat.normalScale.set(maps.normalScale, maps.normalScale);
}
