import { Section } from "@/components/system/section";
import { Container } from "@/components/system/container";
import { Eyebrow } from "@/components/system/eyebrow";
import { DisplayHeading } from "@/components/system/display-heading";
import { GhostKanji } from "@/components/system/ghost-kanji";
import { archive } from "@/lib/data/archive";
import { ArchiveItem } from "./archive-item";

export function Archive() {
  return (
    <Section
      id="archive"
      surface="paper-3"
      className="relative overflow-clip"
    >
      <GhostKanji glyph="蔵" side="right" anchor="bottom" variant="solid" />
      <Container className="relative z-10">
        <div className="max-w-2xl">
          <Eyebrow seal="伍">これまで · ARCHIVE</Eyebrow>
          <DisplayHeading
            as="h2"
            animate="fade-up"
            className="type-section-title mt-6"
          >
            Earlier experiments.
          </DisplayHeading>
          <p className="mt-4 text-ink-2">
            Student projects and side builds, kept for the record. Click a
            thumbnail to play its demo or open the live build.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {archive.map((item) => (
            <div key={item.title} data-animate="fade-up" className="h-full">
              <ArchiveItem item={item} />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
