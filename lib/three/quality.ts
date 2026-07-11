export type Tier = "full" | "reduced" | "static";

export type QualitySettings = {
  tier: Tier;
  dpr: number;
  petals: number;
  blossoms: number;
  parallax: "pointer" | "gyro" | "none";
  animate: boolean;
};

export type TierEnv = {
  width: number;
  reducedMotion: boolean;
  finePointer: boolean;
  deviceMemory?: number;
  cores?: number;
};

/** Pure tier selection: reduced-motion / very-low-end → static; mobile/coarse → reduced; else full. */
export function selectTier(env: TierEnv): QualitySettings {
  const lowEnd =
    (env.deviceMemory !== undefined && env.deviceMemory <= 3) ||
    (env.cores !== undefined && env.cores <= 2);

  if (env.reducedMotion || lowEnd) {
    // Static: render one rich frame, no loop.
    return {
      tier: "static",
      dpr: 2,
      petals: 0,
      blossoms: 260,
      parallax: "none",
      animate: false,
    };
  }

  if (env.width < 1024 || !env.finePointer) {
    return {
      tier: "reduced",
      dpr: 1.5,
      petals: 120,
      blossoms: 200,
      parallax: "gyro",
      animate: true,
    };
  }

  return {
    tier: "full",
    dpr: 2,
    petals: 320,
    blossoms: 420,
    parallax: "pointer",
    animate: true,
  };
}
