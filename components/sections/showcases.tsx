"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Section } from "@/components/system/section";
import { Container } from "@/components/system/container";
import { Eyebrow } from "@/components/system/eyebrow";
import { DisplayHeading } from "@/components/system/display-heading";
import { ShowcaseFrame } from "@/components/showcases/showcase-frame";
import { ScaleToFit } from "@/components/showcases/scale-to-fit";
import { showcases, type Showcase } from "@/lib/data/showcases";
import { AvorinoShowcase } from "@/components/showcases/avorino-showcase";
import { NexwinShowcase } from "@/components/showcases/nexwin-showcase";
import { AduPortalShowcase } from "@/components/showcases/aduportal-showcase";
import { SimpleProjexShowcase } from "@/components/showcases/simpleprojex-showcase";
import { KkbShowcase } from "@/components/showcases/kkb-showcase";

gsap.registerPlugin(ScrollTrigger);

const NUMERALS = ["壱", "弐", "参", "肆", "伍"];

const REDUCE_MQ = "(prefers-reduced-motion: reduce)";

/** Live prefers-reduced-motion, kept in sync with the CSS motion-safe variants. */
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCE_MQ);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCE_MQ).matches,
    () => false,
  );
}

const recreations: Record<Showcase["key"], () => React.ReactNode> = {
  avorino: AvorinoShowcase,
  nexwin: NexwinShowcase,
  aduportal: AduPortalShowcase,
  simpleprojex: SimpleProjexShowcase,
  kkb: KkbShowcase,
};

function Recreation({ k }: { k: Showcase["key"] }) {
  const C = recreations[k];
  // These two are authored in fixed pixels, so they scale-to-fit the panel.
  if (k === "nexwin" || k === "simpleprojex") {
    return (
      <ScaleToFit>
        <C />
      </ScaleToFit>
    );
  }
  return <C />;
}

/** Dotted-leader meta row (menu grammar shared with Skills/Work). */
function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="eyebrow !text-[0.65rem]">{label}</span>
      <span className="flex-1 -translate-y-1 border-b border-dotted border-gold/70" />
      <span className="text-right text-ink-mid">{value}</span>
    </div>
  );
}

export function Showcases() {
  const [flagship, ...rest] = showcases;
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const railInner = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const firstRun = useRef(true);

  // Per-frame triggers drive the rail's active project. Wired at every width
  // (cheap; the rail is CSS-hidden below lg) so a resize across the lg
  // breakpoint never leaves a visible-but-frozen rail.
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      frameRefs.current.forEach((el, i) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  // Crossfade the rail content when the active project changes (not on mount).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (!railInner.current || reduced) return;
    gsap.fromTo(
      railInner.current,
      { opacity: 0.2, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" },
    );
  }, [active, reduced]);

  const current = rest[active];

  return (
    <Section
      id="selected-work"
      surface="paper"
      className="relative overflow-x-clip"
    >
      <Container>
        <div className="max-w-2xl">
          <Eyebrow seal="参">作品 · SELECTED WORK</Eyebrow>
          <DisplayHeading
            as="h2"
            animate="fade-up"
            className="type-section-title mt-6"
          >
            Real products, shipped.
          </DisplayHeading>
          <p className="mt-4 text-ink-2">
            Faithful recreations of landing pages I&apos;ve built — each one in
            its own world. Click any to visit the live site.
          </p>
        </div>
      </Container>

      {/* ── Flagship: full-bleed vermillion band (course 壱) ── */}
      <div className="mt-16 bg-shu py-14 lg:py-20" data-animate="fade-up">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[4fr_8fr] lg:gap-12">
            <div className="relative text-paper">
              <span
                aria-hidden
                className="display pointer-events-none absolute -top-14 -left-3 select-none leading-none text-shu-deep"
                style={{ fontSize: "clamp(8rem, 15vw, 13rem)" }}
              >
                壱
              </span>
              <div className="relative">
                <p className="eyebrow !text-paper/60">旗艦 · FLAGSHIP</p>
                <span className="gold-rule mt-3 block" />
                <h3 className="display type-card-title mt-4">
                  {flagship.name}
                </h3>
                <div className="mt-6 space-y-3">
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="eyebrow !text-[0.65rem] !text-paper/60">
                      ROLE
                    </span>
                    <span className="flex-1 -translate-y-1 border-b border-dotted border-gold/50" />
                    <span className="text-paper/90">
                      {flagship.role} · {flagship.year}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="eyebrow !text-[0.65rem] !text-paper/60">
                      STACK
                    </span>
                    <span className="flex-1 -translate-y-1 border-b border-dotted border-gold/50" />
                    <span className="text-right text-paper/90">
                      {flagship.stack}
                    </span>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-paper/75">
                  The luxury construction brand I build daily — scroll-driven
                  GSAP, Three.js scenes, and a growth-engineering stack behind
                  it.
                </p>
              </div>
            </div>
            <div className="lg:w-[104%]">
              <ShowcaseFrame
                name={flagship.name}
                role={flagship.role}
                year={flagship.year}
                stack={flagship.stack}
                href={flagship.href}
                domain={flagship.domain}
                captionClassName="hidden"
              >
                <Recreation k={flagship.key} />
              </ShowcaseFrame>
            </div>
          </div>
        </Container>
      </div>

      {/* ── Kanji Spine: sticky index rail + remaining courses ── */}
      <Container className="mt-20">
        {/* Two-column template only when the rail can actually show (motion-safe);
            under reduced motion the frames take the full width. */}
        <div className="lg:motion-safe:grid lg:motion-safe:grid-cols-[4fr_8fr] lg:motion-safe:gap-12">
          <div className="hidden lg:motion-safe:block">
            <div className="sticky top-28">
              <div ref={railInner}>
                <span
                  aria-hidden
                  className="text-stroke-gold display block select-none leading-none opacity-80"
                  style={{ fontSize: "clamp(8rem, 12vw, 11rem)" }}
                >
                  {NUMERALS[active + 1]}
                </span>
                <h3 className="display type-card-title mt-4 text-ink">
                  {current.name}
                </h3>
                <div className="mt-5 space-y-3">
                  <MetaRow label="ROLE" value={`${current.role} · ${current.year}`} />
                  <MetaRow label="STACK" value={current.stack} />
                </div>
              </div>
              <div className="mt-8 flex items-center gap-3">
                {rest.map((s, i) => (
                  <span
                    key={s.key}
                    className={
                      i === active
                        ? "h-px w-10 bg-shu transition-all"
                        : "h-px w-6 bg-rule transition-all"
                    }
                  />
                ))}
                <span className="text-xs text-stone">
                  {active + 2} / {showcases.length}
                </span>
              </div>
              <p className="mt-6 text-xs text-stone">
                Click any panel to visit the live site ↗
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-16">
            {rest.map((s, i) => (
              <div
                key={s.key}
                ref={(el) => {
                  frameRefs.current[i] = el;
                }}
                data-animate="fade-up"
              >
                <div className="mb-3 flex items-center gap-3 lg:motion-safe:hidden">
                  <span className="display text-2xl leading-none text-shu">
                    {NUMERALS[i + 1]}
                  </span>
                  <span className="h-px flex-1 bg-rule" />
                </div>
                <ShowcaseFrame
                  name={s.name}
                  role={s.role}
                  year={s.year}
                  stack={s.stack}
                  href={s.href}
                  domain={s.domain}
                  captionClassName="lg:motion-safe:hidden"
                >
                  <Recreation k={s.key} />
                </ShowcaseFrame>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
