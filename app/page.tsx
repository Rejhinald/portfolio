import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Work } from "@/components/sections/work";
import { Showcases } from "@/components/sections/showcases";
import { Skills } from "@/components/sections/skills";
import { Archive } from "@/components/sections/archive";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Work />
      <Showcases />
      <Skills />
      <Archive />
      <Contact />
    </>
  );
}
