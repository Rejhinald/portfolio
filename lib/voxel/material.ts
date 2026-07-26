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
  /**
   * Cross-model plants are single quads, so they must render from both sides.
   * One double-sided quad per plane beats emitting both winding orders.
   */
  doubleSide?: boolean;
  /**
   * Shared 0..1 day->night blend. The mesher bakes both lighting solutions as
   * separate vertex attributes, so animating this cross-fades between them
   * without touching geometry.
   */
  night?: { value: number };
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
    // Cube faces are culled, so back faces never show; plant quads need both.
    side: opts.doubleSide ? THREE.DoubleSide : THREE.FrontSide,
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
    uNight: opts.night ?? { value: 0 },
  };

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `
        #include <common>
        attribute float aSway;
        attribute float aFlow;
        attribute vec3 aNight;
        uniform float uTime;
        uniform float uWindAmp;
        uniform float uNight;
        varying float vLocalY;
        varying float vFlow;
      `,
      )
      .replace(
        "#include <uv_vertex>",
        /* glsl */ `
        #include <uv_vertex>
        vFlow = aFlow;
      `,
      )
      // Cross-fade the two baked lighting solutions. `<color_vertex>` has just
      // written the day colour into vColor, so blending here costs one mix and
      // means switching theme never re-meshes.
      .replace(
        "#include <color_vertex>",
        /* glsl */ `
        #include <color_vertex>
        // NOTE: vColor is a vec4 in current three.js (vec3 in older ones), so the
        // .rgb swizzle is required — mix(vec4, vec3, float) does not compile, and
        // .rgb is valid on both shapes.
        vColor.rgb = mix(vColor.rgb, aNight, uNight);
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
        uniform float uTime;
        varying float vLocalY;
        varying float vFlow;
      `,
      )
      // Flowing water. The atlas is a 16x16 grid, so a tile is 1/16 of UV space;
      // scrolling within that cell animates the surface without a second frame.
      //
      // Two things this has to respect. Varyings are read-only in the fragment
      // stage, so vMapUv cannot be nudged in place — the map chunk is replaced
      // with its own sample. And the scroll is kept inside 0.04..0.96 of the
      // cell rather than wrapping the full 0..1: a true fract() would sample
      // across the tile border into whatever block sits next to water in the
      // atlas, which is exactly the bleeding the half-texel inset exists to stop.
      .replace(
        "#include <map_fragment>",
        /* glsl */ `
        #ifdef USE_MAP
          vec2 flowUv = vMapUv;
          if ( vFlow > 0.5 ) {
            vec2 cell = floor( vMapUv * 16.0 );
            vec2 local = vMapUv * 16.0 - cell;
            local.y = 0.04 + fract( local.y + uTime * 0.22 ) * 0.92;
            flowUv = ( cell + local ) / 16.0;
          }
          vec4 sampledDiffuseColor = texture2D( map, flowUv );
          diffuseColor *= sampledDiffuseColor;
        #endif
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
    `voxel-${opts.cutout ? "cutout" : "opaque"}-${opts.doubleSide ? "ds" : "fs"}` +
    `-${opts.windAmp ?? 1 ? "wind" : "still"}`;

  return mat;
}
