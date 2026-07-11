"use client";

// TEMPORARY sculpting route (removed in cleanup). Swap the factory to review each model.
import { SculptPreview } from "@/components/three/sculpt-preview";
import { createCastleModel } from "@/lib/three/create-castle";

export default function SculptPage() {
  return <SculptPreview make={() => createCastleModel()} camY={1.3} />;
}
