import { Section } from "@/components/system/section";
import { Container } from "@/components/system/container";
import { Eyebrow } from "@/components/system/eyebrow";
import { DisplayHeading } from "@/components/system/display-heading";
import { Hanko } from "@/components/system/hanko";
import { work } from "@/lib/data/work";

const COURSE = ["一", "二", "三"];

export function Work() {
  return (
    <Section id="work" surface="paper-2" className="relative overflow-x-clip">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow seal="弐">職歴 · EXPERIENCE</Eyebrow>
          <DisplayHeading
            as="h2"
            animate="fade-up"
            className="type-section-title mt-6"
          >
            Where I&apos;ve been building.
          </DisplayHeading>
        </div>

        <div className="mt-16 flex flex-col">
          {work.map((job, i) => (
            <div
              key={job.company}
              data-animate="fade-up"
              className="relative grid gap-6 border-t border-rule py-12 lg:grid-cols-[auto_1fr_2fr] lg:gap-10"
            >
              {i === 0 && (
                <span className="absolute -top-4 right-4 lg:right-10">
                  <Hanko glyph="現職" shape="tag" size={34} />
                </span>
              )}
              <span
                aria-hidden
                className="text-stroke-gold display select-none leading-none opacity-70 lg:-ml-10 lg:w-[1.1em]"
                style={{ fontSize: "clamp(3.5rem, 7vw, 7rem)" }}
              >
                {COURSE[i]}
              </span>
              <div>
                <h3 className="display type-card-title text-ink">
                  {job.company}
                </h3>
                <div className="mt-2 flex items-baseline gap-2 text-sm">
                  <span className="text-ink-mid">{job.role}</span>
                  <span className="flex-1 -translate-y-1 border-b border-dotted border-gold/70" />
                  <span className="whitespace-nowrap text-stone">
                    {job.period}
                  </span>
                </div>
              </div>
              <ul className="space-y-3">
                {job.highlights.map((h, k) => (
                  <li key={k} className="flex gap-3 text-ink-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-shu" />
                    <span className="leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
