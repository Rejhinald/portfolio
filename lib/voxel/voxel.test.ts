import { describe, it, expect } from "vitest";
import { AO_SHADE, BLOCK, FACE_SHADE, vertexAO } from "@/lib/voxel/blocks";
import { VoxelGrid } from "@/lib/voxel/grid";
import { tileUV, ATLAS_TILES, UV_INSET } from "@/lib/voxel/atlas";
import { clusterNoise, paintLight } from "@/lib/voxel/light";

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
  it("keeps the denser build inside the world footprint the camera is framed for", () => {
    expect(BLOCK).toBeCloseTo(0.115, 6);
    // The island rim reaches ~28 blocks, so the full span is ~56 blocks. That
    // has to stay in the same 6-7 unit ballpark the camera was set up for.
    const span = 56 * BLOCK;
    expect(span).toBeGreaterThan(6);
    expect(span).toBeLessThan(7.5);
  });
});

describe("paintLight", () => {
  it("darkens a covered block and leaves an open one at full brightness", () => {
    const g = new VoxelGrid();
    g.set(0, 0, 0, "stone"); // open to the sky
    g.set(5, 0, 5, "stone"); // roofed over
    for (let y = 1; y <= 4; y++) g.set(5, y, 5, "stone");

    paintLight(g, { yDark: -10, yLit: 0, reach: 6 });

    expect(g.getShade(0, 0, 0)).toBeCloseTo(1, 6);
    expect(g.getShade(5, 0, 5)).toBeLessThan(0.8);
  });

  it("never drives a block darker than the configured floor", () => {
    const g = new VoxelGrid();
    g.box(0, 0, 0, 0, 12, 0, "stone");
    paintLight(g, { yDark: 0, yLit: 12, reach: 6, minSky: 0.55, minGravity: 0.8 });
    for (let y = 0; y <= 12; y++) {
      expect(g.getShade(0, y, 0)).toBeGreaterThanOrEqual(0.55 * 0.8 - 1e-9);
    }
  });
});

describe("clusterNoise", () => {
  it("stays in range and is deterministic", () => {
    for (let i = 0; i < 50; i++) {
      const v = clusterNoise(i * 3, i, i * 7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
    expect(clusterNoise(4, 5, 6)).toBe(clusterNoise(4, 5, 6));
  });

  it("varies smoothly, so materials form patches instead of speckle", () => {
    // Neighbouring cells must be close together, or the field would behave like
    // per-block randomness — the exact thing it exists to avoid.
    let maxJump = 0;
    for (let x = 0; x < 40; x++) {
      maxJump = Math.max(
        maxJump,
        Math.abs(clusterNoise(x, 0, 0) - clusterNoise(x + 1, 0, 0)),
      );
    }
    expect(maxJump).toBeLessThan(0.35);
  });
});
