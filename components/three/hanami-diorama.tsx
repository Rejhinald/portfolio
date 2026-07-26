"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { StagedScene, type SceneContext, type SceneFrame } from "./staged-scene";
import { selectTier } from "@/lib/three/quality";
import { PALETTE } from "@/lib/three/palette";
import { createVoxelIsland } from "./voxel-island";
import { createPetalField } from "@/lib/three/diorama-petals";
import { createMist } from "@/lib/three/mist";

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

        // Ambient-dominant lighting: vertex colours already carry Minecraft's
        // faceShade * AO, so the directional light is weak and exists mainly to
        // cast the (static) shadow map.
        scene.add(new THREE.HemisphereLight(PALETTE.sora, PALETTE.wakaba, 1.35));
        scene.add(new THREE.AmbientLight(0xffffff, 0.32));
        const sun = new THREE.DirectionalLight(0xfff4e0, 0.55);
        sun.position.set(4.5, 8, 3.5);
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
        // Sits high enough that the voxel spike clears the name lockup below.
        const BASE_Y = wide ? 3.6 : 3.85;
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
        mist.mesh.position.set(ISLAND_X, wide ? 1.5 : 1.1, 0);
        scene.add(mist.mesh);

        const baseCam = new THREE.Vector3(0, wide ? 2.7 : 3.05, wide ? 9.3 : 8.0);
        const target = new THREE.Vector3(wide ? 0 : 0.1, wide ? 2.65 : 3.05, 0);
        camera.position.copy(baseCam);
        camera.lookAt(target);

        if (process.env.NODE_ENV !== "production") {
          // Budget check: expect ~1-3 draw calls and ~20-40k triangles.
          console.info(
            `[voxel] ${island.stats.blocks} blocks -> ${island.stats.faces} faces (${island.stats.triangles} tris)`,
          );
        }

        if (!tier.animate) {
          holder.rotation.y = -0.25;
          return { render: "once" };
        }

        return (t: number) => {
          time.value = t;
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
