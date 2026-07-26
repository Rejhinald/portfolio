"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { StagedScene, type SceneContext, type SceneFrame } from "./staged-scene";
import { selectTier } from "@/lib/three/quality";
import { NIGHT, PALETTE } from "@/lib/three/palette";
import { createVoxelIsland } from "./voxel-island";
import { createPetalField } from "@/lib/three/diorama-petals";
import { createMist } from "@/lib/three/mist";
import { currentTheme, onThemeChange } from "@/lib/theme";

function envTier() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return selectTier({
    width: window.innerWidth,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    finePointer: window.matchMedia("(pointer: fine)").matches,
    deviceMemory: nav.deviceMemory,
    cores: nav.hardwareConcurrency,
  });
}

export function HanamiDiorama({ className }: { className?: string }) {
  const pointer = useRef({ x: 0, y: 0 });
  const tier = useMemo(() => envTier(), []);

  // Parallax input (desktop pointer / mobile gyro), lifecycle-managed here.
  useEffect(() => {
    if (!tier.animate) return;
    if (tier.parallax === "pointer") {
      const onMove = (e: PointerEvent) => {
        pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    }
    if (tier.parallax === "gyro") {
      const onTilt = (e: DeviceOrientationEvent) => {
        pointer.current.x = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 30));
        pointer.current.y = Math.max(-1, Math.min(1, ((e.beta ?? 0) - 45) / 30));
      };
      const DOE = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (DOE && typeof DOE.requestPermission === "function") {
        DOE.requestPermission()
          .then((r) => {
            if (r === "granted") window.addEventListener("deviceorientation", onTilt);
          })
          .catch(() => {});
      } else {
        window.addEventListener("deviceorientation", onTilt);
      }
      return () => window.removeEventListener("deviceorientation", onTilt);
    }
  }, [tier]);

  const init = useMemo(
    () =>
      (ctx: SceneContext): SceneFrame => {
        const { scene, camera, renderer, width, height } = ctx;
        const wide = width / height > 1.15;
        const fog = new THREE.Fog(PALETTE.sora, 11, 26);
        scene.fog = fog;

        // Lighting is deliberately almost FLAT, summing to ~1.0 irradiance.
        // All the directionality already lives in the vertex colours (vanilla's
        // faceShade * AO, times the painted skylight), so any extra light on top
        // just double-counts — at 1.67 it blew mid-grey stone out to near-white
        // and flattened the whole palette. The hemisphere contributes hue rather
        // than brightness, and the sun exists mainly to cast the static shadow.
        const ambient = new THREE.AmbientLight(0xffffff, 0.68);
        scene.add(ambient);
        const hemi = new THREE.HemisphereLight(PALETTE.sora, PALETTE.wakaba, 0.22);
        scene.add(hemi);
        // Sun sits high, left and IN FRONT (+Z is toward the camera) so it lights
        // the tenshu's visible face rather than silhouetting it.
        const sun = new THREE.DirectionalLight(0xfff4e0, 0.25);
        sun.position.set(-6, 9.5, 7);
        sun.name = "sun";
        scene.add(sun);

        const time = { value: 0 };
        // Shared 0..1 blend driving the baked day->night cross-fade.
        const night = { value: 0 };
        const island = createVoxelIsland({ tier: tier.tier, time, night });
        const voxels = island.group;

        // Static shadow map: the sun never moves and the geometry never changes,
        // so render it ONCE — cost is zero from frame 2 onward. Hard-edged
        // (BasicShadowMap) is both the cheapest and the most Minecraft-authentic.
        const shadows = tier.tier !== "static";
        if (shadows) {
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.BasicShadowMap;
          renderer.shadowMap.autoUpdate = false;
          sun.castShadow = true;
          sun.shadow.mapSize.set(tier.tier === "reduced" ? 512 : 1024, tier.tier === "reduced" ? 512 : 1024);
          const c = sun.shadow.camera;
          c.left = -4;
          c.right = 4;
          c.top = 4;
          c.bottom = -4;
          c.near = 0.5;
          c.far = 24;
          c.updateProjectionMatrix();
          sun.shadow.normalBias = 0.03;
          renderer.shadowMap.needsUpdate = true;
        }

        const holder = new THREE.Group();
        holder.name = "island-holder";
        holder.add(voxels);

        // Framing (unchanged from the low-poly version): centred, upper area.
        const ISLAND_X = wide ? 0 : 0.1;
        // Sits high enough that the voxel spike clears the name lockup below,
        // but low enough that the tenshu's finial clears the nav above.
        const BASE_Y = wide ? 2.7 : 3.05;
        holder.position.set(ISLAND_X, BASE_Y, 0);
        holder.scale.setScalar(wide ? 0.56 : 0.42);
        scene.add(holder);

        let petals: { mesh: THREE.InstancedMesh; update: (t: number) => void } | null =
          null;
        if (tier.petals > 0) {
          petals = createPetalField(tier.petals);
          petals.mesh.name = "petals";
          petals.mesh.position.set(ISLAND_X * 0.4, 1.4, 0);
          scene.add(petals.mesh);
        }

        const mist = createMist(tier.animate ? 5 : 4);
        mist.mesh.name = "mist";
        // Below the crag's tip, not through it: at 1.5 the mist plane sat halfway
        // up the rock and washed out its strata and ore pockets.
        mist.mesh.position.set(ISLAND_X, wide ? 0.85 : 0.6, 0);
        scene.add(mist.mesh);

        // Sit ABOVE the island's grass plane and tilt down slightly, so the
        // surface — grass ring, approach path, torii footing — actually reads.
        // Level with it the top face went edge-on and the island looked like a
        // flat plate; much steeper and a building this tall stops reading as a
        // tower. The aim point stays BELOW the island so the tenshu keeps the
        // upper half of the frame and its finial clears the nav.
        const baseCam = new THREE.Vector3(
          0,
          BASE_Y + (wide ? 0.8 : 0.95),
          wide ? 10.6 : 9.2,
        );
        const target = new THREE.Vector3(
          wide ? 0 : 0.1,
          BASE_Y - (wide ? 0.25 : 0.1),
          0,
        );
        camera.position.copy(baseCam);
        camera.lookAt(target);

        /**
         * Apply a theme to the scene. Only uniforms and light intensities change —
         * the geometry carries both lighting solutions, so this never re-meshes.
         */
        const applyTheme = (dark: boolean) => {
          nightTarget = dark ? 1 : 0;
          // Sky, fog and haze all move together, so the island's hazed underside
          // keeps dissolving into the page background rather than into a seam.
          scene.background = null;
          fog.color.setHex(dark ? NIGHT.skyDeep : PALETTE.sora);
          island.hazeColor.setHex(dark ? NIGHT.page : PALETTE.washi);
          // Total irradiance stays ~1.0 in BOTH themes. The darkness of night
          // lives entirely in the baked vertex colours (unlit ~0.2, lantern-lit
          // up to 1.0, emitters pinned at 1.0). Dimming the scene lights as well
          // double-dims, and crushes the lanterns along with everything else —
          // the building went dark instead of glowing.
          ambient.intensity = dark ? 0.86 : 0.68;
          hemi.color.setHex(dark ? NIGHT.moon : PALETTE.sora);
          hemi.groundColor.setHex(dark ? NIGHT.skyDeep : PALETTE.wakaba);
          hemi.intensity = dark ? 0.14 : 0.22;
          // The sun must go nearly out at night, or its N·L term relights the
          // side facing it and undoes the baked lamplight.
          sun.color.setHex(dark ? NIGHT.moon : 0xfff4e0);
          sun.intensity = dark ? 0.04 : 0.25;
          if (shadows) renderer.shadowMap.needsUpdate = true;
        };

        let nightTarget = 0;
        applyTheme(currentTheme() === "dark");
        // Jump straight to the target on first paint: a cross-fade from day is
        // only wanted when the user actually toggles.
        night.value = nightTarget;
        const unsubscribe = onThemeChange((t) => {
          applyTheme(t === "dark");
          // A static-tier scene has no loop to animate the fade, so step it here.
          if (!tier.animate) {
            night.value = nightTarget;
            ctx.requestRender?.();
          }
        });

        if (process.env.NODE_ENV !== "production") {
          // Budget check: expect ~1-3 draw calls and ~20-40k triangles.
          console.info(
            `[voxel] ${island.stats.blocks} blocks -> ${island.stats.faces} faces ` +
              `(${island.stats.triangles} tris, ${island.stats.plants} plants, ` +
              `${island.stats.lightSources} lights) ` +
              `in ${island.stats.buildMs.toFixed(0)}ms`,
          );
        }

        if (!tier.animate) {
          holder.rotation.y = -0.25;
          return { render: "once", dispose: unsubscribe };
        }

        const frame = (t: number) => {
          time.value = t;
          // Ease toward the target so toggling reads as dusk falling, not a cut.
          night.value += (nightTarget - night.value) * 0.08;
          holder.rotation.y = Math.sin(t * 0.12) * 0.45 - 0.1;
          holder.position.y = BASE_Y + Math.sin(t * 0.6) * 0.08;
          petals?.update(t);
          mist.update(t);
          const px = pointer.current.x;
          const py = pointer.current.y;
          camera.position.x += (baseCam.x - px * 0.9 - camera.position.x) * 0.05;
          camera.position.y += (baseCam.y - py * 0.5 - camera.position.y) * 0.05;
          camera.lookAt(target);
        };
        // Hand the theme subscription to StagedScene so it is torn down with the
        // canvas rather than outliving it.
        frame.dispose = unsubscribe;
        return frame;
      },
    [tier],
  );

  return <StagedScene className={className} dpr={tier.dpr} init={init} />;
}
