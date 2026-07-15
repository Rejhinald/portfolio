"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { profile } from "@/lib/data/profile";
import { cn } from "@/lib/utils";

export function Nav() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const { scrollY } = useScroll();

  // Track which section is in view so its nav link carries the shu stamp-dot.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    profile.nav.forEach((n) => {
      const el = document.querySelector(n.href);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 140 && !open);
    setScrolled(y > 40);
  });

  return (
    <motion.header
      variants={{ visible: { y: 0 }, hidden: { y: "-105%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "bg-paper/80 backdrop-blur-md border-b border-rule"
          : "bg-transparent",
      )}
    >
      <nav className="wa-container flex h-16 items-center justify-between md:h-20">
        <a href="#top" className="display text-lg tracking-tight text-ink">
          Arwin<span className="text-shu">.</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {profile.nav.map((n) => (
            <li key={n.href}>
              <a
                href={n.href}
                className="group relative inline-flex items-center gap-1.5 text-sm text-ink-mid transition-colors hover:text-ink"
              >
                <span
                  className={cn(
                    "h-1 w-1 rounded-full bg-shu transition-transform duration-300",
                    active === n.href
                      ? "scale-100"
                      : "scale-0 group-hover:scale-100",
                  )}
                />
                {n.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden rounded-full bg-shu px-4 py-2 text-sm text-paper transition-colors hover:bg-shu-deep sm:inline-block"
          >
            Let&apos;s talk
          </a>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center text-ink md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="wa-container flex flex-col gap-1 pb-6 md:hidden">
          {profile.nav.map((n) => (
            <li key={n.href}>
              <a
                href={n.href}
                onClick={() => setOpen(false)}
                className="block py-2 text-lg text-ink"
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </motion.header>
  );
}
