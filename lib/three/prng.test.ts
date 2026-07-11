import { describe, it, expect } from "vitest";
import { mulberry32, randRange, pick } from "@/lib/three/prng";

describe("mulberry32", () => {
  it("is deterministic for a seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("differs across seeds and stays in [0,1)", () => {
    const r = mulberry32(1);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  it("randRange maps into [min,max)", () => {
    const r = mulberry32(7);
    for (let i = 0; i < 50; i++) {
      const v = randRange(r, 5, 9);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThan(9);
    }
  });

  it("pick returns an element deterministically", () => {
    const r = mulberry32(3);
    const arr = ["a", "b", "c", "d"];
    expect(arr).toContain(pick(r, arr));
  });
});
