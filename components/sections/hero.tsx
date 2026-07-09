import { PetalFieldLazy } from "@/components/three/petal-field-lazy";
import { Eyebrow } from "@/components/system/eyebrow";
import { PillButton } from "@/components/system/pill-button";
import { profile } from "@/lib/data/profile";

export function Hero() {
  return (
    <section className="relative flex h-[100svh] min-h-[640px] flex-col justify-end overflow-hidden">
      {/* Sky → paper gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--wa-sora) 0%, color-mix(in srgb, var(--wa-sora) 28%, var(--wa-paper)) 46%, var(--wa-paper) 100%)",
        }}
      />

      {/* Drifting sakura petals */}
      <PetalFieldLazy className="absolute inset-0" />

      {/* Faint torii corner mark */}
      <svg
        className="pointer-events-none absolute right-8 top-24 hidden opacity-[0.09] md:block"
        width="220"
        height="180"
        viewBox="0 0 220 180"
        fill="none"
        aria-hidden
      >
        <path d="M8 34 H212" stroke="var(--wa-ink)" strokeWidth="7" strokeLinecap="round" />
        <path d="M24 52 H196" stroke="var(--wa-ink)" strokeWidth="5" strokeLinecap="round" />
        <path d="M52 52 V172" stroke="var(--wa-ink)" strokeWidth="7" strokeLinecap="round" />
        <path d="M168 52 V172" stroke="var(--wa-ink)" strokeWidth="7" strokeLinecap="round" />
        <path d="M2 30 Q110 6 218 30" stroke="var(--wa-ink)" strokeWidth="7" fill="none" strokeLinecap="round" />
      </svg>

      {/* Bottom-left editorial lockup */}
      <div className="wa-container relative z-10 pb-20 md:pb-28">
        <div className="max-w-[46rem]">
          <Eyebrow>{profile.eyebrow}</Eyebrow>
          <h1
            className="display mt-6 leading-[0.95] text-ink"
            style={{ fontSize: "var(--text-hero)" }}
          >
            <span data-animate="line-wipe" className="block">
              {profile.firstName}
            </span>
            <span data-animate="line-wipe" className="block">
              {profile.lastName}
            </span>
          </h1>
          <p
            data-animate="fade-up"
            className="mt-8 max-w-xl text-lg text-ink-2 md:text-xl"
          >
            {profile.subhead}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <PillButton href="#selected-work">View work</PillButton>
            <PillButton
              href={profile.cvHref}
              target="_blank"
              variant="ghost"
              arrow={false}
            >
              Download CV
            </PillButton>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-2">
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-ink-mid">
          Scroll
        </span>
        <span className="relative block h-8 w-px bg-rule">
          <span className="wa-scroll-dot absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-shu" />
        </span>
      </div>
    </section>
  );
}
