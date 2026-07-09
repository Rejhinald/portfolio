import { Section } from "@/components/system/section";
import { Container } from "@/components/system/container";
import { Eyebrow } from "@/components/system/eyebrow";
import { DisplayHeading } from "@/components/system/display-heading";
import { skills } from "@/lib/data/skills";

export function Skills() {
  return (
    <Section id="skills" surface="paper">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>道具 · TOOLBOX</Eyebrow>
          <DisplayHeading
            as="h2"
            animate="fade-up"
            className="type-section-title mt-6"
          >
            The stack I reach for.
          </DisplayHeading>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {Object.entries(skills).map(([group, items]) => (
            <div key={group} data-animate="fade-up">
              <p className="eyebrow mb-4">{group}</p>
              <ul className="flex flex-wrap gap-2">
                {items.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-rule bg-paper-2 px-4 py-2 text-sm text-ink transition-colors hover:border-gold"
                  >
                    {s}
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
