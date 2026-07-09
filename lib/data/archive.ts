export type ArchiveItem = {
  title: string;
  tech: string[];
  year: string;
  youtubeId: string;
  blurb: string;
  liveHref?: string;
  githubHref?: string;
};

export const archive: ArchiveItem[] = [
  {
    title: "Delivio",
    tech: ["Next.js", "TypeScript", "Supabase"],
    year: "2024",
    youtubeId: "5vGs2aWqKrI",
    blurb:
      "A freight-delivery platform connecting freelance truckers and businesses.",
    liveHref: "https://delivio-web.vercel.app/",
    githubHref: "https://github.com/naigggs/delivio-web",
  },
  {
    title: "Poem.io",
    tech: ["Next.js", "Gemini", "Python"],
    year: "2024",
    youtubeId: "LRmx_WcMLbA",
    blurb: "A Gemini-powered AI poem generator with mood control.",
    githubHref: "https://github.com/Rejhinald/poem.io",
  },
  {
    title: "Spotify Clone",
    tech: ["Django", "Python", "HTML/CSS"],
    year: "2023",
    youtubeId: "ohxN__j_FE8",
    blurb: "A Django music-streaming clone with auth and playlists.",
  },
  {
    title: "Hotel Management System",
    tech: ["Django", "Python", "HTML/CSS"],
    year: "2023",
    youtubeId: "Is2sRA3_Tp4",
    blurb: "Booking, payments, and admin panels built on Django.",
  },
  {
    title: "San Luis Tourism",
    tech: ["HTML", "CSS"],
    year: "2023",
    youtubeId: "a8ye7j-tTkY",
    blurb: "A tourism showcase page for San Luis, Pampanga.",
    liveHref: "https://rejhinald.github.io/sanluistourism/",
    githubHref: "https://github.com/Rejhinald/sanluistourism",
  },
];
