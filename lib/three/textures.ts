import * as THREE from "three";
import { mulberry32 } from "./prng";

/**
 * A subtle grayscale detail texture (soft mottle blotches + thin branching
 * cracks) meant to MULTIPLY a material's base color — adds a little surface
 * unevenness without shifting the palette. Deterministic per seed.
 */
export function makeDetailTexture(
  seed: number,
  opts?: { cracks?: number; mottle?: number; repeat?: number; crackAlpha?: number },
): THREE.CanvasTexture {
  const rng = mulberry32(seed);
  const S = 128;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  // Light base so the multiply mostly preserves the base color.
  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(0, 0, S, S);

  const mottle = opts?.mottle ?? 0.07;
  for (let i = 0; i < 70; i++) {
    const x = rng() * S;
    const y = rng() * S;
    const r = 3 + rng() * 15;
    const v = Math.round(238 + (rng() * 2 - 1) * mottle * 255);
    ctx.fillStyle = `rgba(${v},${v},${v},0.45)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const cracks = opts?.cracks ?? 9;
  const alpha = opts?.crackAlpha ?? 0.45;
  ctx.strokeStyle = `rgba(110,110,110,${alpha})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < cracks; i++) {
    let x = rng() * S;
    let y = rng() * S;
    let a = rng() * Math.PI * 2;
    const steps = 6 + Math.floor(rng() * 12);
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < steps; s++) {
      a += (rng() * 2 - 1) * 0.85;
      x += Math.cos(a) * 6;
      y += Math.sin(a) * 6;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  const rep = opts?.repeat ?? 3;
  tex.repeat.set(rep, rep);
  return tex;
}
