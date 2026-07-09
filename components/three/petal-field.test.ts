import { describe, it, expect } from "vitest";
import { petalCount } from "@/components/three/petal-field";

describe("petalCount", () => {
  it("returns 0 on mobile widths", () => {
    expect(petalCount(500)).toBe(0);
    expect(petalCount(767)).toBe(0);
  });
  it("scales up on desktop", () => {
    expect(petalCount(1000)).toBeGreaterThan(0);
    expect(petalCount(1440)).toBeGreaterThan(petalCount(1000));
  });
});
