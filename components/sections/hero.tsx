import { HanamiDioramaLazy } from "@/components/three/hanami-diorama-lazy";
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

      {/* Floating hanami island diorama (castle + sakura tree + petals) */}
      <HanamiDioramaLazy className="absolute inset-0" />

      {/* Legibility scrim: fades the lower area toward paper behind the lockup */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to top, var(--wa-paper) 0%, color-mix(in srgb, var(--wa-paper) 55%, transparent) 30%, transparent 56%)",
        }}
      />

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
