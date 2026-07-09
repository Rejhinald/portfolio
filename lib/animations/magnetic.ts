"use client";

import gsap from "gsap";

/**
 * Attaches a magnetic hover effect: the element eases toward the pointer while
 * hovered and springs back on leave. Desktop + non-reduced-motion only.
 * Returns a cleanup function.
 */
export function applyMagnetic(el: HTMLElement, strength = 0.25): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;
  if (reduce || !fine) return () => {};

  // Capture the resting center on enter, subtracting any in-progress GSAP
  // translate, so the pull is measured from the true center — not the shifted
  // element (which would make the follow lag and self-cancel).
  let cx = 0;
  let cy = 0;
  const onEnter = () => {
    const r = el.getBoundingClientRect();
    const gx = (gsap.getProperty(el, "x") as number) || 0;
    const gy = (gsap.getProperty(el, "y") as number) || 0;
    cx = r.left + r.width / 2 - gx;
    cy = r.top + r.height / 2 - gy;
  };
  const onMove = (e: PointerEvent) => {
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.4, ease: "power3.out" });
  };
  const onLeave = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  };

  el.addEventListener("pointerenter", onEnter);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  return () => {
    el.removeEventListener("pointerenter", onEnter);
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    gsap.killTweensOf(el);
  };
}
