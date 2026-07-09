"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setDone(true), reduce ? 0 : 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] grid place-items-center bg-paper transition-opacity duration-700",
        done ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <div className="flex flex-col items-center gap-5">
        <svg
          width="72"
          height="60"
          viewBox="0 0 72 60"
          fill="none"
          className="animate-pulse"
          aria-hidden
        >
          {/* Torii gate */}
          <path d="M4 12 H68" stroke="var(--wa-shu)" strokeWidth="4" strokeLinecap="round" />
          <path d="M10 20 H62" stroke="var(--wa-shu)" strokeWidth="3" strokeLinecap="round" />
          <path d="M18 20 V56" stroke="var(--wa-ink)" strokeWidth="4" strokeLinecap="round" />
          <path d="M54 20 V56" stroke="var(--wa-ink)" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <p className="eyebrow">ようこそ</p>
      </div>
    </div>
  );
}
