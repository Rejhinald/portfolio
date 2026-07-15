import Image from "next/image";
import { Section } from "@/components/system/section";
import { Container } from "@/components/system/container";
import { Eyebrow } from "@/components/system/eyebrow";
import { DisplayHeading } from "@/components/system/display-heading";
import { Hanko } from "@/components/system/hanko";
import { GhostKanji } from "@/components/system/ghost-kanji";

export function About() {
  return (
    <Section id="about" surface="paper" className="relative overflow-clip">
      <GhostKanji glyph="私" side="right" anchor="top" />
      <Container className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
          <div data-animate="fade-up" className="relative lg:-mt-10">
            <span
              aria-hidden
              className="absolute inset-0 translate-x-3 translate-y-3 rounded-lg border border-gold/60"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-rule">
              <Image
                src="/portrait/hanami.jpg"
                alt="Arwin Gerard Miclat beneath cherry blossoms at Osaka Castle"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            {/* Maker's seal on the photo corner */}
            <span className="absolute -right-4 -top-5 z-10 hidden md:block">
              <Hanko glyph="巧" size={64} />
            </span>
            {/* Margin caption rail */}
            <span
              aria-hidden
              className="absolute -right-9 top-1/2 hidden -translate-y-1/2 border-l border-gold/60 pl-2 text-[11px] tracking-[0.25em] text-ink-mid md:block"
              style={{ writingMode: "vertical-rl" }}
            >
              大阪城の桜の下
            </span>
          </div>

          <div>
            <Eyebrow seal="壱">自己紹介 · ABOUT</Eyebrow>
            <DisplayHeading
              as="h2"
              animate="fade-up"
              className="type-section-title mt-6"
            >
              Craft over templates.
            </DisplayHeading>
            <div
              data-animate="fade-up"
              className="mt-6 space-y-4 leading-relaxed text-ink-2"
            >
              <p>
                I&apos;m Arwin — a Computer Engineering graduate from Holy Angel
                University who fell for building on the web. I care about the
                craft: cinematic scroll experiences, fast loads, and interfaces
                considered down to the last hairline.
              </p>
              <p>
                Lately I&apos;ve been shipping marketing sites, growth tooling,
                and 3D-flavored front-ends in Next.js, GSAP, and Three.js. Off
                the clock you&apos;ll find me deep in a video essay, tinkering
                with computer hardware, or chasing a cleaner solution to a
                problem I probably invented.
              </p>
            </div>
            {/* 現在 / NOW as a labeled interrupted rule */}
            <div className="mt-10 flex items-center gap-3" aria-label="Current role">
              <span className="h-px w-10 bg-rule" />
              <span className="eyebrow shrink-0">現在 / NOW</span>
              <span className="text-sm text-ink">
                Associate Developer @ Avorino
              </span>
              <span className="h-px flex-1 border-b border-dotted border-gold/70 bg-transparent" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
