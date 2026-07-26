import * as THREE from "three";

export type VoxelMaterialOpts = {
  atlas: THREE.Texture;
  /** Alpha-tested cutout layer (leaves). */
  cutout?: boolean;
  /** Shared time uniform so every voxel material sways in step. */
  time: { value: number };
  /** Page background the island's underside dissolves into. */
  hazeColor: THREE.Color;
  /** Local Y (world units) where haze starts / is fully applied. */
  hazeTop: number;
  hazeBottom: number;
  /** 0 = no sway (reduced motion). */
  windAmp?: number;
};

/**
 * Voxel material: MeshLambertMaterial patched via onBeforeCompile.
 *
 * We patch rather than write a ShaderMaterial because patching keeps three.js's
 * fog, shadow-map and lighting plumbing intact — a raw ShaderMaterial would
 * force reimplementing all three.
 *
 * Vertex colours already carry vanilla's `faceShade * AO`, so lighting is
 * ambient-dominant with a weak directional (whose real job is the shadow map).
 * SHADE contrast is pre-reduced in the mesher's favour by keeping the light
 * mostly ambient, avoiding double-darkening of the same faces.
 */
export function createVoxelMaterial(
  opts: VoxelMaterialOpts,
): THREE.MeshLambertMaterial {
  const mat = new THREE.MeshLambertMaterial({
    map: opts.atlas,
    vertexColors: true,
    side: THREE.FrontSide, // faces are culled, so back faces never show
    ...(opts.cutout
      ? { transparent: false, alphaTest: 0.5 } // cutout: no sorting, no blending
      : {}),
  });

  const uniforms = {
    uTime: opts.time,
    uWindAmp: { value: opts.windAmp ?? 1 },
    uHazeColor: { value: opts.hazeColor },
    uHazeTop: { value: opts.hazeTop },
    uHazeBottom: { value: opts.hazeBottom },
  };

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `
        #include <common>
        attribute float aSway;
        uniform float uTime;
        uniform float uWindAmp;
        varying float vLocalY;
      `,
      )
      // Displace right after begin_vertex so the offset propagates into
      // projection, worldpos, shadow lookup and fog automatically.
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `
        #include <begin_vertex>
        vLocalY = transformed.y;
        if (aSway > 0.0 && uWindAmp > 0.0) {
          // NOTE: PI2 is already #defined by three.js's <common> chunk —
          // re-declaring it macro-expands into a syntax error.
          vec3 wp = (modelMatrix * vec4(transformed, 1.0)).xyz;
          float pxz = wp.x * 0.9;
          float pz  = wp.z * 0.9;
          float t   = uTime * 0.055;
          // Three octaves, DC-biased: foliage leans with the wind and then
          // jitters, rather than "breathing" around zero.
          vec3 d;
          d.x = (sin(PI2 * (2.0 * pxz + pz - 3.0 * t)) + 0.6) / 24.0;
          d.y = (sin(PI2 * (3.0 * pxz + pz - 4.0 * t)) + 1.2) / 32.0;
          d.z = (sin(PI2 * (1.0 * pxz + pz - 1.5 * t)) + 0.3) / 8.0;
          transformed -= d * aSway * uWindAmp * 0.55;
        }
      `,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `
        #include <common>
        uniform vec3 uHazeColor;
        uniform float uHazeTop;
        uniform float uHazeBottom;
        varying float vLocalY;
      `,
      )
      // Height haze last, so the island's underside dissolves into the page.
      .replace(
        "#include <dithering_fragment>",
        /* glsl */ `
        #include <dithering_fragment>
        float haze = smoothstep(uHazeTop, uHazeBottom, vLocalY);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uHazeColor, haze);
      `,
      );
  };

  // Required: without a distinct cache key three.js may hand this program to
  // other materials sharing Lambert's default key.
  mat.customProgramCacheKey = () =>
    `voxel-${opts.cutout ? "cutout" : "opaque"}-${opts.windAmp ?? 1 ? "wind" : "still"}`;

  return mat;
}
