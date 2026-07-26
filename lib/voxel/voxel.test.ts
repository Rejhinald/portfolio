import { describe, it, expect } from "vitest";
import { AO_SHADE, BLOCK, FACE_SHADE, vertexAO } from "@/lib/voxel/blocks";
import { VoxelGrid } from "@/lib/voxel/grid";
import { tileUV, ATLAS_TILES, UV_INSET } from "@/lib/voxel/atlas";
import { clusterNoise, paintLight } from "@/lib/voxel/light";
import {
  FACING,
  HALF,
  isFullShape,
  outwardFacing,
  packState,
  shapeBoxes,
  stateFacing,
  stateHalf,
} from "@/lib/voxel/shapes";
import { BLOCKS } from "@/lib/voxel/blocks";

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
    expect(BLOCK).toBeCloseTo(0.094, 6);
    // The island rim reaches ~34 blocks, so the full span is ~68 blocks. That
    // has to stay in the same 6-7 unit ballpark the camera was set up for.
    const span = 68 * BLOCK;
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

describe("sub-cube shapes", () => {
  it("packs and unpacks facing + half", () => {
    for (const f of [FACING.PX, FACING.NX, FACING.PZ, FACING.NZ]) {
      for (const h of [HALF.BOTTOM, HALF.TOP]) {
        const s = packState(f, h);
        expect(stateFacing(s)).toBe(f);
        expect(stateHalf(s)).toBe(h);
      }
    }
  });

  it("a cube is one full box", () => {
    expect(shapeBoxes("cube", 0)).toEqual([[0, 0, 0, 1, 1, 1]]);
  });

  it("a bottom slab fills only the lower half", () => {
    const [b] = shapeBoxes("slab", packState(FACING.PX, HALF.BOTTOM));
    expect(b).toEqual([0, 0, 0, 1, 0.5, 1]);
  });

  it("a top slab is the vertical mirror of a bottom slab", () => {
    const [b] = shapeBoxes("slab", packState(FACING.PX, HALF.TOP));
    expect(b).toEqual([0, 0.5, 0, 1, 1, 1]);
  });

  it("a stair is a half slab plus a quarter step on the facing side", () => {
    const boxes = shapeBoxes("stair", packState(FACING.PX, HALF.BOTTOM));
    expect(boxes).toHaveLength(2);
    expect(boxes[0]).toEqual([0, 0, 0, 1, 0.5, 1]); // base
    expect(boxes[1]).toEqual([0.5, 0.5, 0, 1, 1, 1]); // step at +X
  });

  it("puts the step on the opposite side for the opposite facing", () => {
    const boxes = shapeBoxes("stair", packState(FACING.NX, HALF.BOTTOM));
    expect(boxes[1]).toEqual([0, 0.5, 0, 0.5, 1, 1]);
  });

  it("an upside-down stair mirrors vertically", () => {
    const boxes = shapeBoxes("stair", packState(FACING.PZ, HALF.TOP));
    expect(boxes[0]).toEqual([0, 0.5, 0, 1, 1, 1]); // slab on top
    expect(boxes[1]).toEqual([0, 0, 0.5, 1, 0.5, 1]); // step below
  });

  it("every shape's boxes stay inside the unit cube", () => {
    for (const shape of ["cube", "slab", "stair"] as const) {
      for (let s = 0; s < 8; s++) {
        for (const b of shapeBoxes(shape, s)) {
          for (const v of b) {
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThanOrEqual(1);
          }
          expect(b[3]).toBeGreaterThan(b[0]);
          expect(b[4]).toBeGreaterThan(b[1]);
          expect(b[5]).toBeGreaterThan(b[2]);
        }
      }
    }
  });

  it("only a cube counts as a full occluder", () => {
    expect(isFullShape("cube")).toBe(true);
    expect(isFullShape("slab")).toBe(false);
    expect(isFullShape("stair")).toBe(false);
  });

  it("orients outward from the dominant axis", () => {
    expect(outwardFacing(5, 1)).toBe(FACING.PX);
    expect(outwardFacing(-5, 1)).toBe(FACING.NX);
    expect(outwardFacing(1, 5)).toBe(FACING.PZ);
    expect(outwardFacing(1, -5)).toBe(FACING.NZ);
  });
});

describe("VoxelGrid occlusion split", () => {
  it("a slab blocks light but may not cull a neighbouring face", () => {
    const g = new VoxelGrid();
    g.setShaped(0, 0, 0, "roofslab", FACING.PX, HALF.BOTTOM);
    // Blocks light (so eave shadows and AO still work)...
    expect(g.isSolid(0, 0, 0)).toBe(true);
    // ...but is not a full cube, so it must not hide what sits beside it.
    expect(g.isFullOpaque(0, 0, 0)).toBe(false);
  });

  it("a full cube does both", () => {
    const g = new VoxelGrid();
    g.set(0, 0, 0, "stone");
    expect(g.isSolid(0, 0, 0)).toBe(true);
    expect(g.isFullOpaque(0, 0, 0)).toBe(true);
  });

  it("plants and bars occlude nothing", () => {
    const g = new VoxelGrid();
    g.set(0, 0, 0, "shortgrass");
    g.set(1, 0, 0, "window");
    for (const x of [0, 1]) {
      expect(g.isSolid(x, 0, 0)).toBe(false);
      expect(g.isFullOpaque(x, 0, 0)).toBe(false);
    }
  });
});

describe("block registry integrity", () => {
  it("every block names six faces", () => {
    for (const [id, def] of Object.entries(BLOCKS)) {
      expect(def.faces, id).toHaveLength(6);
      for (const [tx, ty] of def.faces) {
        expect(tx, id).toBeGreaterThanOrEqual(0);
        expect(ty, id).toBeGreaterThanOrEqual(0);
        expect(tx, id).toBeLessThan(ATLAS_TILES);
        expect(ty, id).toBeLessThan(ATLAS_TILES);
      }
    }
  });

  it("plants are always cutout and non-occluding", () => {
    for (const [id, def] of Object.entries(BLOCKS)) {
      if (!def.plant) continue;
      expect(def.cutout, id).toBe(true);
      expect(def.transparent, id).toBe(true);
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
