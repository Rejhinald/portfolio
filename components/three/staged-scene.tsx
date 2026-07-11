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

/**
 * init returns one of:
 *  - a function → animated: called every rAF (IntersectionObserver-gated)
 *  - { render: "once" } or void → static: rendered a single frame, no loop
 */
export type SceneFrame = ((elapsed: number) => void) | { render: "once" } | void;

type StagedSceneProps = {
  className?: string;
  /** Device-pixel-ratio cap (tier decides). Default 2. */
  dpr?: number;
  init: (ctx: SceneContext) => SceneFrame;
};

/**
 * Reusable raw-three.js host. Creates renderer/scene/camera, gates the animated
 * rAF loop with an IntersectionObserver, caps DPR (tiered by the caller), and
 * disposes everything (geometry, material, GL context, canvas) on unmount. It
 * does NOT bail on viewport width — the caller decides the tier (including a
 * static one-shot render for reduced-motion / low-end).
 */
export function StagedScene({ className, dpr = 2, init }: StagedSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(init);
  useEffect(() => {
    initRef.current = init;
  }, [init]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let width = wrap.clientWidth || window.innerWidth;
    let height = wrap.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 10;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // WebGL unavailable — leave the fallback background showing.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, dpr));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    wrap.appendChild(renderer.domElement);

    const frame = initRef.current({ scene, camera, renderer, width, height });
    const animated = typeof frame === "function";
    const renderOnce = () => renderer.render(scene, camera);

    const start = performance.now();
    let raf = 0;
    let visible = true;

    if (animated) {
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!visible) return;
        (frame as (t: number) => void)((performance.now() - start) / 1000);
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(loop);
    } else {
      renderOnce();
      raf = requestAnimationFrame(renderOnce); // once more after layout settles
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!animated && visible) renderOnce();
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
      if (!animated) renderOnce();
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as
          | THREE.Material
          | THREE.Material[]
          | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.parentNode?.removeChild(renderer.domElement);
    };
  }, [dpr]);

  return <div ref={wrapRef} className={className} aria-hidden="true" />;
}
