"use client";

import dynamic from "next/dynamic";

/** Client-only lazy wrapper so three.js is code-split out of the initial bundle. */
export const PetalFieldLazy = dynamic(
  () => import("./petal-field").then((m) => m.PetalField),
  { ssr: false },
);
