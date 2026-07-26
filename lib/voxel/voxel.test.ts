import { describe, it, expect } from "vitest";
import { AO_SHADE, BLOCK, FACE_SHADE, vertexAO } from "@/lib/voxel/blocks";
import { VoxelGrid } from "@/lib/voxel/grid";
import { tileUV, ATLAS_TILES, UV_INSET } from "@/lib/voxel/atlas";

describe("vertexAO (0fps rule)", () => {
  it("returns 3 when nothing occludes", () => {
    expect(vertexAO(false, false, false)).toBe(3);
  });
  it("returns 2 for one side, or corner only", () => {
    expect(vertexAO(true, false, false)).toBe(2);
    expect(vertexAO(false, true, false)).toBe(2);
    expect(vertexAO(false, false, true)).toBe(2);
  });
  it("returns 1 for one side plus corner", () => {
    expect(vertexAO(true, false, true)).toBe(1);
    expect(vertexAO(false, true, true)).toBe(1);
  });
  it("short-circuits to 0 when both sides occlude, corner irrelevant", () => {
    expect(vertexAO(true, true, false)).toBe(0);
    expect(vertexAO(true, true, true)).toBe(0);
  });
});

describe("vanilla shade tables", () => {
  it("AO maps to Minecraft's four values via 0.4 + 0.2*ao", () => {
    expect([...AO_SHADE]).toEqual([0.4, 0.6, 0.8, 1.0]);
    for (let ao = 0; ao <= 3; ao++) {
      expect(AO_SHADE[ao]).toBeCloseTo(0.4 + 0.2 * ao, 6);
    }
  });
  it("face brightness matches vanilla: top 1.0, bottom 0.5, Z 0.8, X 0.6", () => {
    // order: +X,-X,+Y,-Y,+Z,-Z
    expect([...FACE_SHADE]).toEqual([0.6, 0.6, 1.0, 0.5, 0.8, 0.8]);
  });
});

describe("VoxelGrid", () => {
  it("stores and reads blocks, and reports solidity", () => {
    const g = new VoxelGrid();
    g.set(1, 2, 3, "stone");
    expect(g.get(1, 2, 3)).toBe("stone");
    expect(g.isSolid(1, 2, 3)).toBe(true);
    expect(g.isSolid(0, 0, 0)).toBe(false);
  });

  it("treats leaves as non-occluding (like MC glass/leaves)", () => {
    const g = new VoxelGrid();
    g.set(0, 0, 0, "leaves");
    expect(g.has(0, 0, 0)).toBe(true);
    expect(g.isSolid(0, 0, 0)).toBe(false);
  });

  it("setIfEmpty does not overwrite", () => {
    const g = new VoxelGrid();
    g.set(0, 0, 0, "grass");
    g.setIfEmpty(0, 0, 0, "stone");
    expect(g.get(0, 0, 0)).toBe("grass");
  });

  it("box fills inclusively", () => {
    const g = new VoxelGrid();
    g.box(0, 0, 0, 1, 1, 1, "dirt");
    expect(g.size).toBe(8);
  });

  it("disc fills a round footprint", () => {
    const g = new VoxelGrid();
    g.disc(0, 0, 0, 2, "grass");
    expect(g.get(0, 0, 0)).toBe("grass");
    expect(g.get(2, 0, 0)).toBe("grass");
    expect(g.get(3, 0, 0)).toBeUndefined(); // outside radius
  });
});

describe("atlas UVs", () => {
  it("insets each tile by half a texel in atlas space", () => {
    const [u0, v0, u1, v1] = tileUV(0, 0);
    const s = 1 / ATLAS_TILES;
    expect(u0).toBeCloseTo(UV_INSET, 6);
    expect(u1).toBeCloseTo(s - UV_INSET, 6);
    // Canvas row 0 is the TOP of the image -> highest v.
    expect(v1).toBeCloseTo(1 - UV_INSET, 6);
    expect(v0).toBeCloseTo(1 - s + UV_INSET, 6);
  });

  it("keeps tiles inside their own cell (no bleed into neighbours)", () => {
    const s = 1 / ATLAS_TILES;
    for (let tx = 0; tx < ATLAS_TILES; tx++) {
      const [u0, , u1] = tileUV(tx, 1);
      expect(u0).toBeGreaterThan(tx * s);
      expect(u1).toBeLessThan((tx + 1) * s);
    }
  });
});

describe("scale", () => {
  it("uses one uniform block size sized for a chunky on-screen voxel", () => {
    expect(BLOCK).toBeCloseTo(0.26, 6);
    // ~13-block island radius stays in the same world-space ballpark as the
    // previous low-poly island (2.6-3.4 units) so framing/camera values hold.
    expect(13 * BLOCK).toBeGreaterThan(2.6);
    expect(13 * BLOCK).toBeLessThan(3.6);
  });
});
