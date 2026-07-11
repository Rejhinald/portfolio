"use client";

// TEMPORARY sculpting route (removed in cleanup). Swap the factory to review each model.
import { SculptPreview } from "@/components/three/sculpt-preview";
import { createSakuraTreeModel } from "@/lib/three/create-sakura-tree";

export default function SculptPage() {
  return <SculptPreview make={() => createSakuraTreeModel()} camY={1.2} />;
}
