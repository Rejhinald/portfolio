"use client";

// TEMPORARY sculpting route (removed in cleanup). Swap the factory to review each model.
import * as THREE from "three";
import { SculptPreview } from "@/components/three/sculpt-preview";
import { createIslandModel } from "@/lib/three/create-island";
import { createToriiModel, createLanternModel } from "@/lib/three/create-set-dressing";

export default function SculptPage() {
  return (
    <SculptPreview
      camY={1.6}
      make={() => {
        const g = new THREE.Group();
        g.add(createIslandModel());
        const torii = createToriiModel();
        torii.position.set(-1.1, 0, 0.6);
        torii.scale.setScalar(0.8);
        g.add(torii);
        const lantern = createLanternModel();
        lantern.position.set(1.2, 0, -0.4);
        g.add(lantern);
        return g;
      }}
    />
  );
}
