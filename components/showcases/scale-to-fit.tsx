"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders fixed-pixel recreation content at a `w`×`h` reference and scales it to
 * fill the parent (the frame's 16:10 screen). Used for showcase panels that
 * aren't authored in container-query units, so they stay proportional at any
 * panel width instead of overflowing/clipping on narrow viewports.
 */
export function ScaleToFit({
  w = 1200,
  h = 750,
  children,
}: {
  w?: number;
  h?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / w);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div
        style={{
          position: "relative",
          width: w,
          height: h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          visibility: scale === 0 ? "hidden" : "visible",
        }}
      >
        {children}
      </div>
    </div>
  );
}
