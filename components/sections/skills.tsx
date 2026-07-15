import { Section } from "@/components/system/section";
import { Container } from "@/components/system/container";
import { Eyebrow } from "@/components/system/eyebrow";
import { DisplayHeading } from "@/components/system/display-heading";
import { GhostKanji } from "@/components/system/ghost-kanji";
import { skillGroups } from "@/lib/data/skills";

export function Skills() {
  return (
    <Section id="skills" surface="paper" className="relative overflow-clip">
      <GhostKanji glyph="技" side="left" anchor="bottom" />
      <Container className="relative z-10">
        <div className="max-w-2xl">
          <Eyebrow seal="肆">道具 · TOOLBOX</Eyebrow>
          <DisplayHeading
            as="h2"
            animate="fade-up"
            className="type-section-title mt-6"
          >
            The stack I reach for.
          </DisplayHeading>
          <p className="mt-4 text-sm text-ink-mid">
            <span className="text-shu">●</span> daily driver{" "}
            <span className="ml-4 text-stone">○</span> in rotation
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[5fr_4fr_3fr] lg:gap-10">
          {skillGroups.map((group) => (
            <div
              key={group.en}
              data-animate="fade-up-stagger"
              className="relative border-l border-gold/60 pl-8"
            >
              <span
                aria-hidden
                className="display absolute -left-[0.72rem] top-0 bg-paper py-1 text-lg text-gold-deep"
                style={{ writingMode: "vertical-rl" }}
              >
                {group.label}
              </span>
              <p className="eyebrow mb-5">{group.en}</p>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li key={item.name} className="flex items-baseline gap-2">
                    <span className="text-ink">{item.name}</span>
                    <span className="flex-1 -translate-y-1 border-b border-dotted border-gold/70" />
                    {item.daily ? (
                      <span className="text-xs text-shu" aria-label="daily driver">
                        ●
                      </span>
                    ) : (
                      <span className="text-xs text-stone" aria-label="in rotation">
                        ○
                      </span>
                    )}
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
