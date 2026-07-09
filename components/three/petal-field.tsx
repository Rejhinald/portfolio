"use client";

import { useCallback } from "react";
import * as THREE from "three";
import { StagedScene, type SceneContext } from "./staged-scene";

/** Instance count for a viewport width (0 disables the scene on mobile). */
export function petalCount(width: number): number {
  if (width < 768) return 0;
  if (width < 1280) return 180;
  return 320;
}

const PETAL_COLORS = [0xf4cdd6, 0xe8a0b4, 0xfaf1f3, 0xffffff];

function makePetalGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.11, 0.09, 0.13, 0.3, 0, 0.42);
  shape.bezierCurveTo(-0.13, 0.3, -0.11, 0.09, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 6);
  geo.center();
  return geo;
}

export function PetalField({ className }: { className?: string }) {
  const init = useCallback((ctx: SceneContext) => {
    const count = petalCount(ctx.width);
    if (count === 0) return;

    const geometry = makePetalGeometry();
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // Field bounds (world units at the camera's view).
    const SPAN_X = 9;
    const TOP_Y = 6.5;
    const RANGE_Y = 13;
    const color = new THREE.Color();

    type Petal = {
      seedX: number;
      z: number;
      offsetY: number;
      fall: number;
      swayAmp: number;
      swaySpeed: number;
      swayPhase: number;
      rotSpeed: number;
      rotX: number;
      rotY: number;
      scale: number;
    };
    const petals: Petal[] = [];
    for (let i = 0; i < count; i++) {
      petals.push({
        seedX: (Math.random() * 2 - 1) * SPAN_X,
        z: (Math.random() * 2 - 1) * 3,
        offsetY: Math.random() * RANGE_Y,
        fall: 0.5 + Math.random() * 0.7,
        swayAmp: 0.4 + Math.random() * 0.9,
        swaySpeed: 0.4 + Math.random() * 0.8,
        swayPhase: Math.random() * Math.PI * 2,
        rotSpeed: 0.4 + Math.random() * 1.2,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
        scale: 0.7 + Math.random() * 0.8,
      });
      color.setHex(PETAL_COLORS[i % PETAL_COLORS.length]);
      mesh.setColorAt(i, color);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    ctx.scene.add(mesh);

    const dummy = new THREE.Object3D();
    return (elapsed: number) => {
      for (let i = 0; i < count; i++) {
        const p = petals[i];
        const y = TOP_Y - ((elapsed * p.fall + p.offsetY) % RANGE_Y);
        const x = p.seedX + Math.sin(elapsed * p.swaySpeed + p.swayPhase) * p.swayAmp;
        dummy.position.set(x, y, p.z);
        dummy.rotation.set(
          p.rotX + elapsed * p.rotSpeed * 0.5,
          p.rotY + elapsed * p.rotSpeed,
          elapsed * p.rotSpeed * 0.7,
        );
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
  }, []);

  return <StagedScene className={className} init={init} />;
}
