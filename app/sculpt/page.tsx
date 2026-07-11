"use client";

// TEMPORARY sculpting route (removed in cleanup). Full diorama over the hero sky gradient.
import { HanamiDioramaLazy } from "@/components/three/hanami-diorama-lazy";

export default function SculptPage() {
  return (
    <main className="relative h-[100svh] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--wa-sora) 0%, color-mix(in srgb, var(--wa-sora) 28%, var(--wa-paper)) 46%, var(--wa-paper) 100%)",
        }}
      />
      <HanamiDioramaLazy className="absolute inset-0" />
    </main>
  );
}
