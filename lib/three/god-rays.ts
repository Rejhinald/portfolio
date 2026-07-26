import * as THREE from "three";

/**
 * Volumetric light shafts (god rays) — geometric, not post-processed.
 *
 * The usual way to do god rays is a screen-space radial blur from the light's
 * projected position. That technique structurally requires the light to sit
 * BEHIND the subject and be partly occluded by it, which silhouettes the
 * subject. The brief here is the opposite: the light has to face the building so
 * the tenshu stays lit and readable. So instead of a post pass, the shafts are
 * real geometry — a fan of long additive blades sharing the light's axis, which
 * reads as a volume from any angle and lets the sun sit wherever we want.
 *
 * That choice also avoids EffectComposer entirely: no extra render targets, no
 * resize plumbing, and it still works with the scene's "render once" static mode.
 *
 * Blades are additive with `depthWrite: false` and depth testing ON, so shafts
 * passing behind the castle are correctly occluded by it rather than glowing
 * through — without that, the building looks like it is made of fog.
 */

export type LightShaftsOpts = {
  /** Direction the light travels (from the sun toward the scene). */
  direction: THREE.Vector3;
  /** Roughly where the viewer is, so blades can be turned to face them. */
  viewDir?: THREE.Vector3;
  /** Number of discrete beams. */
  count?: number;
  /** Beam length, and the total width of the spread they occupy. */
  length?: number;
  spread?: number;
  color?: THREE.ColorRepresentation;
  /** Peak additive brightness. Keep low: the scene is lit to ~1.0 on purpose. */
  intensity?: number;
  /** 0 disables the shimmer (reduced motion / static tier). */
  animate?: boolean;
};

export type LightShafts = {
  group: THREE.Group;
  update: (t: number) => void;
  dispose: () => void;
};

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uIntensity;
  uniform float uTime;
  uniform float uSeed;
  varying vec2  vUv;

  void main() {
    // Across the blade: squared falloff so the core is bright and the edge
    // vanishes, which is what stops a blade reading as a hard-edged polygon.
    float across = abs(vUv.x - 0.5) * 2.0;
    float a = 1.0 - across;
    a *= a;

    // Along the blade: ramp in from the light, fade out before the far end so
    // the shaft has no visible tip.
    float along = vUv.y;
    a *= smoothstep(0.0, 0.30, along);
    a *= 1.0 - smoothstep(0.45, 1.0, along);

    // Slow breathing, offset per blade, so the volume drifts like real haze.
    a *= 0.72 + 0.28 * sin(uTime * 0.35 + uSeed * 6.2831 + along * 2.4);

    a *= uIntensity;
    // Premultiplied: additive blending ignores destination alpha.
    gl_FragColor = vec4(uColor * a, a);
  }
`;

export function createLightShafts(opts: LightShaftsOpts): LightShafts {
  const count = opts.count ?? 9;
  const length = opts.length ?? 22;
  const spread = opts.spread ?? 9;
  const intensity = opts.intensity ?? 0.34;
  const color = new THREE.Color(opts.color ?? 0xfff4e2);

  const group = new THREE.Group();
  group.name = "god-rays";

  // Build an explicit frame: +Y along the light's travel, +Z toward the viewer.
  // Turning every beam to face the camera is what makes them read as separate
  // shafts; a fan rotated about the light axis just renders as one soft wedge.
  const up = opts.direction.clone().normalize();
  const view = (opts.viewDir ?? new THREE.Vector3(0, 0, 1)).clone().normalize();
  let right = new THREE.Vector3().crossVectors(up, view);
  if (right.lengthSq() < 1e-6) right = new THREE.Vector3(1, 0, 0);
  right.normalize();
  const fwd = new THREE.Vector3().crossVectors(right, up).normalize();
  group.matrixAutoUpdate = false;
  group.matrix.makeBasis(right, up, fwd);
  group.matrix.decompose(group.position, group.quaternion, group.scale);
  group.matrixAutoUpdate = true;

  const mats: THREE.ShaderMaterial[] = [];
  const geos: THREE.BufferGeometry[] = [];
  const time = { value: 0 };

  for (let i = 0; i < count; i++) {
    // Deterministic pseudo-random widths and gaps: even spacing reads as a
    // venetian blind, while varied beams read as light through leaves.
    const r = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const rr = Math.abs(r);
    const w = 0.35 + rr * 0.95;
    const t = count === 1 ? 0.5 : i / (count - 1);
    const x = (t - 0.5) * spread + (rr - 0.5) * 0.7;

    const geo = new THREE.PlaneGeometry(w, length, 1, 1);
    geo.translate(0, length * 0.5, 0);
    geos.push(geo);

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uColor: { value: color },
        // Thin beams need to be brighter to read at all; wide ones would smear.
        uIntensity: { value: intensity * (0.6 + 0.8 * (1 - w / 1.3)) },
        uTime: time,
        uSeed: { value: rr },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true, // shafts behind the castle stay behind it
      side: THREE.DoubleSide,
    });
    const blade = new THREE.Mesh(geo, mat);
    blade.name = `shaft-${i}`;
    blade.position.x = x;
    blade.position.z = (rr - 0.5) * 1.5; // slight depth scatter
    group.add(blade);
    mats.push(mat);
  }

  return {
    group,
    update: (t: number) => {
      time.value = opts.animate === false ? 1.6 : t;
    },
    dispose: () => {
      for (const g of geos) g.dispose();
      for (const m of mats) m.dispose();
    },
  };
}
