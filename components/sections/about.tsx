import Image from "next/image";
import { Section } from "@/components/system/section";
import { Container } from "@/components/system/container";
import { Eyebrow } from "@/components/system/eyebrow";
import { DisplayHeading } from "@/components/system/display-heading";

export function About() {
  return (
    <Section id="about" surface="paper">
      <Container>
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div data-animate="fade-up" className="relative">
            <span
              aria-hidden
              className="absolute inset-0 translate-x-3 translate-y-3 rounded-lg border border-gold/60"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-rule">
              <Image
                src="/portrait/hanami.jpg"
                alt="Arwin Gerard Miclat beneath cherry blossoms at Osaka Castle"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
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
            <p className="mt-8 inline-flex flex-wrap items-center gap-3 text-sm">
              <span className="eyebrow">現在 / NOW</span>
              <span className="text-ink">Associate Developer @ Avorino</span>
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
