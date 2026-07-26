import * as THREE from "three";
import { describe, it } from "vitest";
import { mulberry32 } from "@/lib/three/prng";
import { VoxelGrid } from "@/lib/voxel/grid";
import { meshGrid, type MeshResult } from "@/lib/voxel/mesher";
import { paintLight } from "@/lib/voxel/light";
import { buildIsland } from "@/lib/voxel/models/island";
import { buildCastle } from "@/lib/voxel/models/castle";
import { buildSakuraTree } from "@/lib/voxel/models/tree";
import { buildTorii } from "@/lib/voxel/models/dressing";
import { BLOCKS } from "@/lib/voxel/blocks";

function statAttrs(g: THREE.BufferGeometry | null, label: string) {
  if (!g) return { label, bytes: 0, verts: 0 };
  let bytes = 0;
  const rows: string[] = [];
  for (const name of Object.keys(g.attributes)) {
    const a = g.attributes[name];
    const b = a.array.byteLength;
    bytes += b;
    rows.push(
      `    ${name.padEnd(9)} ${a.itemSize}x ${a.array.constructor.name.padEnd(13)} count=${a.count} bytes=${b}`,
    );
  }
  const idx = g.index;
  const ib = idx ? idx.array.byteLength : 0;
  bytes += ib;
  rows.push(
    `    index     1x ${idx ? idx.array.constructor.name : "none"} count=${idx ? idx.count : 0} bytes=${ib}`,
  );
  console.log(`  ${label}: verts=${g.attributes.position.count} tris=${(idx?.count ?? 0) / 3} totalBytes=${bytes} (${(bytes / 1048576).toFixed(3)} MB)`);
  rows.forEach((r) => console.log(r));
  return { label, bytes, verts: g.attributes.position.count };
}

describe("MEASURE", () => {
  it("real scene: blocks, faces, phase timings, geometry bytes", () => {
    // ---- per-model block counts (isolated) ----
    const models: [string, (g: VoxelGrid) => void][] = [
      ["island", (g) => buildIsland(g, mulberry32(20260726))],
      ["castle", (g) => buildCastle(g, 0, 0, mulberry32(20260726))],
      ["tree", (g) => buildSakuraTree(g, -22, 8, mulberry32(20260726))],
      ["torii", (g) => buildTorii(g, 0, 24)],
    ];
    for (const [name, fn] of models) {
      const g = new VoxelGrid();
      fn(g);
      console.log(`  isolated ${name}: ${g.size} blocks`);
    }

    // ---- full scene, 7 runs ----
    const runs: {
      author: number; paint: number; mesh: number; total: number;
      blocks: number; faces: number;
    }[] = [];
    let lastMesh: MeshResult | null = null;
    let lastGrid: VoxelGrid | null = null;

    for (let r = 0; r < 7; r++) {
      const rng = mulberry32(20260726);
      const t0 = performance.now();
      const grid = new VoxelGrid();
      buildIsland(grid, rng);
      buildCastle(grid, 0, 0, rng);
      buildSakuraTree(grid, -22, 8, rng);
      buildTorii(grid, 0, 24);
      const t1 = performance.now();
      paintLight(grid, { yDark: -18, yLit: 4, reach: 7, minSky: 0.55, minGravity: 0.62 });
      const t2 = performance.now();
      const res = meshGrid(grid);
      const t3 = performance.now();
      runs.push({
        author: t1 - t0, paint: t2 - t1, mesh: t3 - t2, total: t3 - t0,
        blocks: grid.size, faces: res.faceCount,
      });
      lastMesh = res;
      lastGrid = grid;
    }
    const med = (k: keyof (typeof runs)[0]) =>
      [...runs].map((x) => x[k]).sort((a, b) => a - b)[Math.floor(runs.length / 2)];
    console.log(
      `  FULL SCENE blocks=${runs[0].blocks} faces=${runs[0].faces} tris=${runs[0].faces * 2}`,
    );
    console.log(
      `  median ms: author=${med("author").toFixed(1)} paint=${med("paint").toFixed(1)} mesh=${med("mesh").toFixed(1)} TOTAL=${med("total").toFixed(1)}`,
    );
    console.log(
      `  all totals: ${runs.map((x) => x.total.toFixed(1)).join(", ")}`,
    );

    // ---- block id histogram + cutout/opaque split ----
    const hist = new Map<string, number>();
    for (const [, , , id] of lastGrid!.entries())
      hist.set(id, (hist.get(id) ?? 0) + 1);
    const sorted = [...hist.entries()].sort((a, b) => b[1] - a[1]);
    console.log("  block histogram: " + sorted.map(([k, v]) => `${k}=${v}`).join(" "));
    let cutoutBlocks = 0;
    for (const [k, v] of hist) if (BLOCKS[k as keyof typeof BLOCKS].cutout) cutoutBlocks += v;
    console.log(`  cutout blocks=${cutoutBlocks} opaque blocks=${lastGrid!.size - cutoutBlocks}`);

    // ---- geometry bytes ----
    const o = statAttrs(lastMesh?.opaque ?? null, "opaque");
    const c = statAttrs(lastMesh?.cutout ?? null, "cutout");
    console.log(
      `  TOTAL GEOMETRY BYTES=${o.bytes + c.bytes} (${((o.bytes + c.bytes) / 1048576).toFixed(3)} MB) for ${runs[0].faces} faces -> ${((o.bytes + c.bytes) / runs[0].faces).toFixed(1)} bytes/face`,
    );

    // ---- shade map memory ----
    console.log(`  shade entries=${lastGrid!.size} (Map<number,number>)`);
  }, 120000);

  it("scaling: synthetic grids at 1x / 1.5x / 2x / 2.5x linear resolution", () => {
    // A synthetic stand-in with the SAME structural mix as the real scene:
    // a solid blob (island: solid volume, shell-only faces) plus hollow towers
    // (castle: shell volume, both-sides faces) plus a porous cutout blob (tree).
    const build = (s: number) => {
      const g = new VoxelGrid();
      const rng = mulberry32(7);
      const R = Math.round(28 * s);
      const DEPTH = Math.round(22 * s);
      // solid island: discs of decreasing radius
      for (let y = 0; y >= -DEPTH; y--) {
        const t = -y / DEPTH;
        const r = Math.max(1, R * Math.pow(1 - t, 1.15) + (y % 4 === 0 ? 2 * s : 0));
        const ri = Math.ceil(r);
        for (let x = -ri; x <= ri; x++)
          for (let z = -ri; z <= ri; z++)
            if (x * x + z * z <= r * r) g.set(x, y, z, y === 0 ? "grass" : "stone");
      }
      // hollow castle: 5 tiers of ring walls + solid roof plates
      let y = 1;
      const tiers = [16, 14, 11, 9, 7, 5].map((h) => Math.round(h * s));
      for (const half of tiers) {
        const rows = Math.round(9 * s);
        for (let k = 0; k < rows; k++, y++) g.ring(0, 0, y, half, "plaster");
        for (let k = 0; k < Math.round(4 * s); k++, y++) {
          const outer = half + Math.round(3 * s) - k;
          for (let x = -outer; x <= outer; x++)
            for (let z = -outer; z <= outer; z++) {
              const r = Math.max(Math.abs(x), Math.abs(z));
              if (r >= outer - 1) g.set(x, y, z, "roof");
            }
        }
      }
      // cutout foliage blob
      const cr = 7 * s;
      const cy = Math.round(12 * s);
      const cx = -Math.round(22 * s);
      const cz = Math.round(8 * s);
      for (let dy = -Math.ceil(cr * 0.65); dy <= Math.ceil(cr * 0.65); dy++)
        for (let dx = -Math.ceil(cr); dx <= Math.ceil(cr); dx++)
          for (let dz = -Math.ceil(cr); dz <= Math.ceil(cr); dz++) {
            const d = Math.sqrt((dx / cr) ** 2 + (dy / (cr * 0.65)) ** 2 + (dz / cr) ** 2)
              + (rng() - 0.5) * 0.4;
            if (d > 1) continue;
            if (rng() < 0.12) continue;
            g.setIfEmpty(cx + dx, cy + dy, cz + dz, "leaves");
          }
      return g;
    };

    for (const s of [1, 1.25, 1.5, 2, 2.5]) {
      const reps = s > 1.6 ? 3 : 5;
      const out: number[][] = [];
      let blocks = 0, faces = 0, cutFaces = 0;
      for (let r = 0; r < reps; r++) {
        const t0 = performance.now();
        const g = build(s);
        const t1 = performance.now();
        paintLight(g, { yDark: -18 * s, yLit: 4 * s, reach: 7, minSky: 0.55, minGravity: 0.62 });
        const t2 = performance.now();
        const m = meshGrid(g);
        const t3 = performance.now();
        out.push([t1 - t0, t2 - t1, t3 - t2, t3 - t0]);
        blocks = g.size;
        faces = m.faceCount;
        cutFaces = m.cutout ? (m.cutout.index!.count / 3) / 2 : 0;
      }
      const pick = (i: number) =>
        [...out].map((x) => x[i]).sort((a, b) => a - b)[Math.floor(reps / 2)];
      console.log(
        `  s=${s}: blocks=${blocks} faces=${faces} cutoutFaces=${cutFaces} ` +
          `author=${pick(0).toFixed(1)} paint=${pick(1).toFixed(1)} mesh=${pick(2).toFixed(1)} TOTAL=${pick(3).toFixed(1)}ms ` +
          `-> ${(faces / pick(3)).toFixed(0)} faces/ms, ${(blocks / pick(3)).toFixed(0)} blocks/ms`,
      );
    }
  }, 300000);
});
