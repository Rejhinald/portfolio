"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { StagedScene, type SceneContext, type SceneFrame } from "./staged-scene";
import { selectTier } from "@/lib/three/quality";
import { PALETTE } from "@/lib/three/palette";
import { createVoxelIsland } from "./voxel-island";
import { createPetalField } from "@/lib/three/diorama-petals";
import { createMist } from "@/lib/three/mist";
import { createLightShafts } from "@/lib/three/god-rays";

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
        scene.fog = new THREE.Fog(PALETTE.sora, 11, 26);

        // Lighting is deliberately almost FLAT, summing to ~1.0 irradiance.
        // All the directionality already lives in the vertex colours (vanilla's
        // faceShade * AO, times the painted skylight), so any extra light on top
        // just double-counts — at 1.67 it blew mid-grey stone out to near-white
        // and flattened the whole palette. The hemisphere contributes hue rather
        // than brightness, and the sun exists mainly to cast the static shadow.
        scene.add(new THREE.AmbientLight(0xffffff, 0.68));
        scene.add(new THREE.HemisphereLight(PALETTE.sora, PALETTE.wakaba, 0.22));
        // Sun sits high, left and IN FRONT (+Z is toward the camera), so it lights
        // the tenshu's visible face. A sun behind the building would give stronger
        // shafts but silhouette the subject, which is the opposite of the brief.
        const SUN_POS = new THREE.Vector3(-6, 9.5, 7);
        const sun = new THREE.DirectionalLight(0xfff4e0, 0.25);
        sun.position.copy(SUN_POS);
        sun.name = "sun";
        scene.add(sun);

        const time = { value: 0 };
        const island = createVoxelIsland({ tier: tier.tier, time });
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

        // Sit ABOVE the island's grass plane and tilt down ~10°, so the surface
        // — grass ring, approach path, torii footing — actually reads. Level
        // with it the top face went edge-on and the island looked like a plate;
        // much steeper and a building this tall stops reading as a tower.
        // The aim point stays BELOW the island so the tenshu keeps the upper
        // half of the frame and clears the nav.
        // A taller tenshu (the stone plinth added ~9 courses) needs both a
        // longer lens distance and a shallower tilt, or the finial clips the nav.
        // God rays: a fan of additive blades along the sun's travel direction,
        // anchored above and in front of the island so the shafts sweep down past
        // the tenshu rather than out from behind it.
        // Kept SHORT and high: additive light can only read against the blue upper
        // sky. Extended down into the washi-paper half of the hero it desaturates
        // the background instead of brightening it, and looks like smudges.
        const shafts = createLightShafts({
          direction: new THREE.Vector3(0, 0, 0).sub(SUN_POS).normalize(),
          viewDir: new THREE.Vector3(0, 0, 1),
          count: tier.tier === "full" ? 8 : 5,
          length: 9.5,
          spread: 7,
          intensity: tier.tier === "full" ? 0.26 : 0.2,
          color: 0xfff6e4,
          animate: tier.animate,
        });
        shafts.group.position.copy(SUN_POS).multiplyScalar(0.52);
        shafts.group.position.y += 2.4;
        scene.add(shafts.group);

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

        if (process.env.NODE_ENV !== "production") {
          // Budget check: expect ~1-3 draw calls and ~20-40k triangles.
          console.info(
            `[voxel] ${island.stats.blocks} blocks -> ${island.stats.faces} faces ` +
              `(${island.stats.triangles} tris, ${island.stats.plants} plants) ` +
              `in ${island.stats.buildMs.toFixed(0)}ms`,
          );
        }

        if (!tier.animate) {
          holder.rotation.y = -0.25;
          shafts.update(0);
          return { render: "once" };
        }

        return (t: number) => {
          time.value = t;
          shafts.update(t);
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
      },
    [tier],
  );

  return <StagedScene className={className} dpr={tier.dpr} init={init} />;
}
