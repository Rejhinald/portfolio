"use client";

/**
 * Scroll-driven 0→1 progress for a tall section using its bounding rect.
 * rAF-throttled, IntersectionObserver-paused while off-screen. No GSAP pin
 * (React-unmount safe — pair with CSS `position: sticky` on an inner stage).
 * Returns a cleanup function.
 */
export function createStickyProgress(
  section: HTMLElement,
  onProgress: (p: number) => void,
): () => void {
  let raf = 0;
  let active = false;

  const compute = () => {
    raf = 0;
    const rect = section.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0));
    onProgress(total > 0 ? scrolled / total : 0);
  };

  const onScroll = () => {
    if (!active) return;
    if (!raf) raf = requestAnimationFrame(compute);
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      active = entry.isIntersecting;
      if (active) onScroll();
    },
    { threshold: 0 },
  );
  io.observe(section);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  return () => {
    io.disconnect();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (raf) cancelAnimationFrame(raf);
  };
}
