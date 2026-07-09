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

const recreations: Record<Showcase["key"], () => React.ReactNode> = {
  avorino: AvorinoShowcase,
  nexwin: NexwinShowcase,
  aduportal: AduPortalShowcase,
  simpleprojex: SimpleProjexShowcase,
  kkb: KkbShowcase,
};

export function Showcases() {
  return (
    <Section id="selected-work" surface="paper">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>作品 · SELECTED WORK</Eyebrow>
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

        <div className="mx-auto mt-16 flex max-w-5xl flex-col gap-20">
          {showcases.map((s) => {
            const Recreation = recreations[s.key];
            // These two are authored in fixed pixels (not container-query
            // units), so they need the scale-to-fit wrapper to stay proportional.
            const needsScale = s.key === "nexwin" || s.key === "simpleprojex";
            return (
              <div key={s.key} data-animate="fade-up">
                <ShowcaseFrame {...s}>
                  {needsScale ? (
                    <ScaleToFit>
                      <Recreation />
                    </ScaleToFit>
                  ) : (
                    <Recreation />
                  )}
                </ShowcaseFrame>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
