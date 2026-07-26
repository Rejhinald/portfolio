export type Showcase = {
  key:
    | "avorino"
    | "nexwin"
    | "aduportal"
    | "simpleprojex"
    | "kkb"
    | "dailylearnings";
  name: string;
  role: string;
  year: string;
  stack: string;
  href: string;
  domain: string;
};

export const showcases: Showcase[] = [
  {
    key: "avorino",
    name: "Avorino",
    role: "Associate Developer",
    year: "2025",
    stack: "Next.js · GSAP · Three.js · Cloudflare",
    href: "https://avorino.com",
    domain: "avorino.com",
  },
  {
    key: "nexwin",
    name: "Nexwin Capital",
    role: "Sole Developer",
    year: "2026",
    stack: "Next.js · Bun/Hono · Three.js · Cloudflare",
    href: "https://nexwincapital.com",
    domain: "nexwincapital.com",
  },
  {
    key: "aduportal",
    name: "ADUPortal",
    role: "Developer",
    year: "2026",
    stack: "Next.js · Turborepo · Bun/Hono",
    href: "https://aduportal.com",
    domain: "aduportal.com",
  },
  {
    key: "simpleprojex",
    name: "SimpleProjex",
    role: "SimpleProjex",
    year: "Ongoing",
    stack: "Next.js · Tailwind v4 · Framer Motion",
    href: "https://simpleprojex.com",
    domain: "simpleprojex.com",
  },
  {
    key: "kkb",
    name: "KKB — Kanya-Kanyang Bayad",
    role: "Solo Developer",
    year: "2026",
    stack: "Next.js · Tailwind v4 · shadcn",
    href: "https://kkb-three.vercel.app",
    domain: "kkb-three.vercel.app",
  },
  {
    key: "dailylearnings",
    name: "Daily Learnings",
    role: "Solo Developer",
    year: "2026",
    stack: "Next.js · TypeScript",
    href: "https://daily-learnings.vercel.app",
    domain: "daily-learnings.vercel.app",
  },
];
