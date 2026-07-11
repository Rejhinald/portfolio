"use client";

import dynamic from "next/dynamic";

/** Client-only lazy wrapper so three.js + the diorama are code-split out of the initial bundle. */
export const HanamiDioramaLazy = dynamic(
  () => import("./hanami-diorama").then((m) => m.HanamiDiorama),
  { ssr: false },
);
