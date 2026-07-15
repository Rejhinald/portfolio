export type SkillItem = { name: string; daily?: boolean };

export type SkillGroup = {
  /** Kanji group label rendered vertically on the column rule. */
  label: string;
  en: string;
  items: SkillItem[];
};

export const skillGroups: SkillGroup[] = [
  {
    label: "表",
    en: "Frontend",
    items: [
      { name: "Next.js", daily: true },
      { name: "React", daily: true },
      { name: "TypeScript", daily: true },
      { name: "Tailwind CSS", daily: true },
      { name: "Shadcn/ui" },
      { name: "GSAP", daily: true },
      { name: "Three.js", daily: true },
      { name: "Framer Motion" },
      { name: "Recharts" },
    ],
  },
  {
    label: "裏",
    en: "Backend",
    items: [
      { name: "Bun" },
      { name: "Hono" },
      { name: "Drizzle ORM" },
      { name: "PostgreSQL", daily: true },
      { name: "Zod" },
      { name: "React Hook Form" },
      { name: "TanStack Query" },
    ],
  },
  {
    label: "台",
    en: "Platform",
    items: [
      { name: "Cloudflare Workers", daily: true },
      { name: "Cloudflare R2" },
      { name: "Google Gemini AI" },
      { name: "JustCall API" },
    ],
  },
];
