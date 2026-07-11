"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { StagedScene, type SceneContext, type SceneFrame } from "./staged-scene";
import { selectTier } from "@/lib/three/quality";
import { PALETTE } from "@/lib/three/palette";
import { createIslandModel } from "@/lib/three/create-island";
import { createCastleModel } from "@/lib/three/create-castle";
import { createSakuraTreeModel } from "@/lib/three/create-sakura-tree";
import { createToriiModel, createLanternModel } from "@/lib/three/create-set-dressing";
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
        const { scene, camera } = ctx;
        scene.fog = new THREE.Fog(PALETTE.sora, 11, 26);

        scene.add(new THREE.HemisphereLight(PALETTE.sora, PALETTE.wakaba, 1.0));
        const key = new THREE.DirectionalLight(0xfff2e0, 1.15);
        key.position.set(5, 8, 4);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xbfd8ec, 0.42);
        rim.position.set(-5, 3, -6);
        scene.add(rim);
        scene.add(new THREE.AmbientLight(0xffffff, 0.2));

        const island = new THREE.Group();
        island.add(createIslandModel({ tier: tier.tier }));

        const castle = createCastleModel({ tier: tier.tier });
        castle.scale.setScalar(0.5);
        castle.position.set(0.25, 0, -0.15);
        island.add(castle);

        const tree = createSakuraTreeModel({ tier: tier.tier });
        tree.scale.setScalar(0.62);
        tree.position.set(-1.35, 0, 0.55);
        island.add(tree);

        const torii = createToriiModel();
        torii.scale.setScalar(0.5);
        torii.position.set(1.3, 0, 0.95);
        torii.rotation.y = -0.4;
        island.add(torii);

        const lantern = createLanternModel();
        lantern.position.set(0.95, 0, -1.15);
        island.add(lantern);

        const BASE_Y = 1.95;
        island.position.set(1.35, BASE_Y, 0);
        island.scale.setScalar(0.92);
        scene.add(island);

        let petals: { mesh: THREE.InstancedMesh; update: (t: number) => void } | null = null;
        if (tier.petals > 0) {
          petals = createPetalField(tier.petals);
          petals.mesh.position.set(0.8, 1.4, 0);
          scene.add(petals.mesh);
        }

        const mist = createMist(tier.animate ? 5 : 4);
        mist.mesh.position.set(1.35, 0.4, 0);
        scene.add(mist.mesh);

        const baseCam = new THREE.Vector3(0, 2.1, 9.4);
        const target = new THREE.Vector3(1.15, 2.05, 0);
        camera.position.copy(baseCam);
        camera.lookAt(target);

        if (!tier.animate) {
          island.rotation.y = -0.25;
          return { render: "once" };
        }

        return (t: number) => {
          island.rotation.y = Math.sin(t * 0.12) * 0.45 - 0.1;
          island.position.y = BASE_Y + Math.sin(t * 0.6) * 0.08;
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
