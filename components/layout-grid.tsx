"use client";
import React from "react";
import { LayoutGrid } from "@/components/ui/layout-grid";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { cards } from "@/components/data/data"; // Import the cards from data.tsx

export function LayoutGridDemo() {
  return (
    <div className="h-screen py-20 w-full bg-slate-950 relative z-10">
      <LayoutGrid cards={cards} />
      <div className="absolute inset-0 -z-10">
        <BackgroundBeams />
      </div>
    </div>
  );
}
