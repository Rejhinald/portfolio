import { describe, it, expect } from "vitest";
import { selectTier } from "@/lib/three/quality";

describe("selectTier", () => {
  it("reduced-motion → static, no animation, no petals", () => {
    const q = selectTier({ width: 1440, reducedMotion: true, finePointer: true });
    expect(q.tier).toBe("static");
    expect(q.animate).toBe(false);
    expect(q.petals).toBe(0);
    expect(q.parallax).toBe("none");
  });

  it("desktop fine-pointer → full, pointer parallax, dpr ≤ 2", () => {
    const q = selectTier({ width: 1440, reducedMotion: false, finePointer: true });
    expect(q.tier).toBe("full");
    expect(q.parallax).toBe("pointer");
    expect(q.dpr).toBeLessThanOrEqual(2);
    expect(q.animate).toBe(true);
  });

  it("mobile → reduced, gyro, fewer petals than full, dpr ≤ 1.5", () => {
    const full = selectTier({ width: 1440, reducedMotion: false, finePointer: true });
    const mob = selectTier({ width: 414, reducedMotion: false, finePointer: false });
    expect(mob.tier).toBe("reduced");
    expect(mob.parallax).toBe("gyro");
    expect(mob.petals).toBeLessThan(full.petals);
    expect(mob.blossoms).toBeLessThan(full.blossoms);
    expect(mob.dpr).toBeLessThanOrEqual(1.5);
  });

  it("very low-end → static", () => {
    const q = selectTier({
      width: 1440,
      reducedMotion: false,
      finePointer: true,
      deviceMemory: 2,
      cores: 2,
    });
    expect(q.tier).toBe("static");
  });
});
