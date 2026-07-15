import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Work } from "@/components/sections/work";
import { Showcases } from "@/components/sections/showcases";
import { Skills } from "@/components/sections/skills";
import { Archive } from "@/components/sections/archive";
import { Contact } from "@/components/sections/contact";
import { SectionRule } from "@/components/system/section-rule";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <SectionRule numeral="弐" />
      <Work />
      <SectionRule numeral="参" />
      <Showcases />
      <SectionRule numeral="肆" />
      <Skills />
      <SectionRule numeral="伍" />
      <Archive />
      <SectionRule numeral="陸" />
      <Contact />
    </>
  );
}
