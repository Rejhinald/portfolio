"use client";

import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Wraps each word of an element's text in a `<span class="wa-word">`,
 * preserving whitespace as real text nodes (a11y / copy-paste safe).
 */
export function splitIntoWords(el: HTMLElement): void {
  const text = el.textContent ?? "";
  const tokens = text.split(/(\s+)/);
  el.textContent = "";
  for (const token of tokens) {
    if (token.length === 0) continue;
    if (/^\s+$/.test(token)) {
      el.appendChild(document.createTextNode(token));
    } else {
      const span = document.createElement("span");
      span.className = "wa-word";
      span.textContent = token;
      el.appendChild(span);
    }
  }
}

const START = "top 88%";
const ONCE = "play none none none" as const;

/**
 * Mount-once hook (run by <RevealProvider/>). Queries every `[data-animate]`
 * element, wires its GSAP reveal inside a single gsap.context, and removes the
 * attribute so it is idempotent. Bails (leaves content visible) on
 * prefers-reduced-motion.
 */
export function useReveal(): void {
  useIsomorphicLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray<HTMLElement>("[data-animate]");
      els.forEach((el) => {
        const kind = el.dataset.animate;
        el.removeAttribute("data-animate");
        if (reduce || !kind) return;

        const scrollTrigger = { trigger: el, start: START, toggleActions: ONCE };

        switch (kind) {
          case "fade-up":
            gsap.set(el, { y: 50, opacity: 0, filter: "blur(4px)" });
            gsap.to(el, {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger,
            });
            break;
          case "fade-up-stagger": {
            const kids = Array.from(el.children) as HTMLElement[];
            gsap.set(kids, { y: 40, opacity: 0 });
            gsap.to(kids, {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.12,
              scrollTrigger,
            });
            break;
          }
          case "word-stagger": {
            el.style.overflow = "hidden";
            splitIntoWords(el);
            const words = el.querySelectorAll<HTMLElement>(".wa-word");
            gsap.set(words, { yPercent: 115, opacity: 0 });
            gsap.to(words, {
              yPercent: 0,
              opacity: 1,
              duration: 0.9,
              ease: "power4.out",
              stagger: 0.05,
              scrollTrigger,
            });
            break;
          }
          case "blur-focus":
            gsap.set(el, { opacity: 0, filter: "blur(12px)" });
            gsap.to(el, {
              opacity: 1,
              filter: "blur(0px)",
              duration: 1.2,
              ease: "power2.out",
              scrollTrigger,
            });
            break;
          case "line-wipe":
            gsap.set(el, { clipPath: "inset(0 0 100% 0)", y: 16 });
            gsap.to(el, {
              clipPath: "inset(0 0 0% 0)",
              y: 0,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger,
            });
            break;
          case "parallax":
            gsap.to(el, {
              yPercent: -15,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            });
            break;
        }
      });
    });

    // Reveal trigger positions are measured at mount against fallback-font
    // metrics; recompute once the display:swap webfonts land and on resize so
    // start/end offsets track the actual (post-swap) layout.
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);
}
