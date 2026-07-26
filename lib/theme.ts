export type Theme = "light" | "dark";

export const THEME_KEY = "wa-theme";

/**
 * Runs in the document head, BEFORE first paint, so the page never flashes the
 * wrong palette. Kept as a string because it has to be inlined synchronously —
 * a React effect runs too late and a media query alone cannot express "the user
 * explicitly chose light while their OS is dark".
 *
 * Deliberately swallows errors: localStorage throws in some privacy modes, and a
 * theme preference is never worth breaking the page over.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var s=localStorage.getItem(${JSON.stringify(THEME_KEY)});
var d=window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.setAttribute("data-theme", s==="dark"||s==="light"?s:(d?"dark":"light"));
}catch(e){}})();`;

/** The theme currently stamped on <html>. */
export function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

/** Apply and persist a theme, notifying listeners (the 3D scene subscribes). */
export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* private mode — the choice just will not persist */
  }
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }));
}

/** Fired on <window> whenever the theme changes. */
export const THEME_EVENT = "wa-themechange";

/**
 * Subscribe to theme changes. Returns an unsubscribe function.
 * Used by the diorama, which cross-fades between baked day and night colours.
 */
export function onThemeChange(fn: (theme: Theme) => void): () => void {
  const handler = (e: Event) => fn((e as CustomEvent<Theme>).detail);
  window.addEventListener(THEME_EVENT, handler);
  return () => window.removeEventListener(THEME_EVENT, handler);
}
