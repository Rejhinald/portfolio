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

  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.4, ease: "power3.out" });
  };
  const onLeave = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  };

  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  return () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    gsap.killTweensOf(el);
  };
}
