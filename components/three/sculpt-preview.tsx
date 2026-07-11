"use client";

import * as THREE from "three";
import { StagedScene } from "./staged-scene";
import { PALETTE } from "@/lib/three/palette";

/**
 * TEMPORARY sculpting harness (removed in cleanup). Renders one model on a
 * neutral turntable with the diorama light rig so it can be screenshot-reviewed
 * pass-by-pass per the Object Sculptor pipeline.
 */
export function SculptPreview({
  make,
  camY = 1.1,
}: {
  make: () => THREE.Group;
  camY?: number;
}) {
  return (
    <StagedScene
      className="fixed inset-0"
      init={({ scene, camera }) => {
        scene.background = new THREE.Color(0xdfe3e8);
        camera.position.set(4.6, 3.4, 5.6);
        camera.lookAt(0, camY, 0);

        scene.add(new THREE.HemisphereLight(PALETTE.sora, PALETTE.wakaba, 0.95));
        const key = new THREE.DirectionalLight(0xfff2e0, 1.15);
        key.position.set(5, 8, 4);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xbfd8ec, 0.4);
        rim.position.set(-4, 3, -5);
        scene.add(rim);
        scene.add(new THREE.AmbientLight(0xffffff, 0.22));

        const model = make();
        const box = new THREE.Box3().setFromObject(model);
        const c = box.getCenter(new THREE.Vector3());
        model.position.x -= c.x;
        model.position.z -= c.z;
        model.position.y -= box.min.y;
        scene.add(model);

        const shadow = new THREE.Mesh(
          new THREE.CircleGeometry(2.4, 40),
          new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.16,
          }),
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.002;
        scene.add(shadow);

        return (t: number) => {
          model.rotation.y = t * 0.32;
        };
      }}
    />
  );
}
