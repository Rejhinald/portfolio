"use client";

import { useSyncExternalStore } from "react";
import { Lamp, LampWallUp } from "lucide-react";
import {
  THEME_EVENT,
  currentTheme,
  setTheme,
  type Theme,
} from "@/lib/theme";

/**
 * 夜 / 昼 toggle.
 *
 * The theme lives in the DOM — an inline script in the head stamps `data-theme`
 * before first paint — so this reads it through `useSyncExternalStore` rather
 * than mirroring it into component state. Copying it into state with an effect
 * both trips `react-hooks/set-state-in-effect` and starts out wrong for one
 * frame; subscribing to the real source has neither problem.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

/** The server has no DOM to read, so it always renders the light icon. */
const serverSnapshot = (): Theme => "light";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, currentTheme, serverSnapshot);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = `Switch to ${next} mode`;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className={`grid h-10 w-10 place-items-center rounded-full text-ink-mid transition-colors hover:text-ink ${className}`}
    >
      {theme === "dark" ? (
        <Lamp size={18} aria-hidden />
      ) : (
        <LampWallUp size={18} aria-hidden />
      )}
    </button>
  );
}
