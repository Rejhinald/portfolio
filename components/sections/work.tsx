import { Section } from "@/components/system/section";
import { Container } from "@/components/system/container";
import { Eyebrow } from "@/components/system/eyebrow";
import { DisplayHeading } from "@/components/system/display-heading";
import { work } from "@/lib/data/work";

export function Work() {
  return (
    <Section id="work" surface="paper-2">
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
          {work.map((job) => (
            <div
              key={job.company}
              data-animate="fade-up"
              className="grid gap-6 border-t border-rule py-10 md:grid-cols-[1fr_2fr]"
            >
              <div>
                <h3 className="display type-card-title text-ink">
                  {job.company}
                </h3>
                <p className="mt-1 text-ink-mid">{job.role}</p>
                <p className="mt-1 text-sm text-stone">{job.period}</p>
              </div>
              <ul className="space-y-3">
                {job.highlights.map((h, i) => (
                  <li key={i} className="flex gap-3 text-ink-2">
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
