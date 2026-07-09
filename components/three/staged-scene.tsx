"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export type SceneContext = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  width: number;
  height: number;
};

type StagedSceneProps = {
  className?: string;
  /** Build the scene; optionally return an onFrame(elapsedSeconds) callback. */
  init: (ctx: SceneContext) => ((elapsed: number) => void) | void;
};

/**
 * Reusable raw-three.js host. Creates renderer/scene/camera, gates the rAF loop
 * with an IntersectionObserver, caps DPR at 2, bails entirely on mobile /
 * reduced-motion, and disposes everything (geometry, material, GL context,
 * canvas node) on unmount.
 */
export function StagedScene({ className, init }: StagedSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(init);
  initRef.current = init;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || window.innerWidth < 768) return;

    let width = wrap.clientWidth || window.innerWidth;
    let height = wrap.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    wrap.appendChild(renderer.domElement);

    const onFrame =
      initRef.current({ scene, camera, renderer, width, height }) || undefined;

    const start = performance.now();
    let raf = 0;
    let visible = true;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      onFrame?.((performance.now() - start) / 1000);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(wrap);

    const ro = new ResizeObserver(() => {
      width = wrap.clientWidth || width;
      height = wrap.clientHeight || height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.parentNode?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={wrapRef} className={className} aria-hidden="true" />;
}
