import gsap from "gsap";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Cache banner elements to avoid repeated DOM queries
let banners: (HTMLElement | null)[] = [];

// Initialize banners once
const initBanners = () => {
  if (banners.length === 0) {
    banners = [
      document.getElementById("banner-1"),
      document.getElementById("banner-2"),
      document.getElementById("banner-3"),
      document.getElementById("banner-4"),
    ];
  }
  return banners.every(banner => banner !== null);
};

// Constants for colors and animation settings
const COLORS = {
  initial: "rgb(18, 32, 47)",
  final: "rgb(15, 23, 42)",
  transition: "rgb(0, 111, 184)"
} as const;

const ANIMATION_CONFIG = {
  duration: 0.5,
  ease: "power2.inOut",
  stagger: 0.1, // Reduced stagger time for snappier animation
  force3D: true, // Enable hardware acceleration
} as const;

export const animatePageIn = () => {
  if (!initBanners()) return;

  // Kill any existing tweens to prevent animation conflicts
  gsap.killTweensOf(banners);

  gsap.timeline({
    defaults: ANIMATION_CONFIG,
  })
    .set(banners, {
      yPercent: 0,
      backgroundColor: COLORS.initial,
      immediateRender: true, // Ensures immediate rendering of first frame
    })
    .to(banners, {
      yPercent: 100,
      backgroundColor: COLORS.final,
      clearProps: "transform", // Clear transform after animation
    });
};

export const animatePageOut = (href: string, router: AppRouterInstance) => {
  if (!initBanners()) return;

  // Kill any existing tweens
  gsap.killTweensOf(banners);

  gsap.timeline({
    defaults: {
      ...ANIMATION_CONFIG,
      onComplete: () => {
        router.push(href);
        // Clean up transforms after animation
        gsap.set(banners, { clearProps: "all" });
      },
    },
  })
    .set(banners, {
      yPercent: -100,
      backgroundColor: COLORS.transition,
      immediateRender: true,
    })
    .to(banners, {
      yPercent: 0,
      backgroundColor: COLORS.initial,
    });
};