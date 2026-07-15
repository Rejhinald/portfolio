import { profile } from "@/lib/data/profile";
import { Hanko } from "@/components/system/hanko";

export function Footer() {
  return (
    <footer className="relative bg-ink text-paper">
      <div className="wa-container flex flex-col gap-10 py-16 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="display text-3xl">{profile.name}</p>
          <p className="mt-2 text-sm text-paper/60">
            {profile.role} · {profile.location}
          </p>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <ul className="flex flex-wrap gap-5">
            {profile.socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b border-dotted border-gold/60 pb-0.5 text-sm text-paper/70 transition-colors hover:border-solid hover:border-shu hover:text-paper"
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#top"
            className="text-sm text-paper/60 transition-colors hover:text-paper"
          >
            Back to top ↑
          </a>
        </div>
      </div>
      <div className="wa-container flex items-center justify-between border-t border-white/10 py-6 text-xs text-paper/40">
        <span>© 2026 {profile.name}</span>
        <span className="inline-flex items-center gap-3">
          <Hanko glyph="桜" size={34} animate={false} />
          Crafted with GSAP &amp; Three.js
        </span>
      </div>
    </footer>
  );
}
