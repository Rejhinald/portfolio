import { cn } from "@/lib/utils";

type GhostKanjiProps = {
  glyph: string;
  side: "left" | "right";
  anchor: "top" | "bottom";
  /** "stroke" = gold outline (default); "solid" = filled paper-3 for weight variety. */
  variant?: "stroke" | "solid";
};

/**
 * One enormous ghost kanji per allowed section (kanji budget: About 私,
 * Skills 技, Archive 蔵, Contact 手紙), bleeding off the section edge.
 * Parent section must be `relative` with `overflow-x: clip`.
 */
export function GhostKanji({
  glyph,
  side,
  anchor,
  variant = "stroke",
}: GhostKanjiProps) {
  return (
    <span
      aria-hidden
      data-animate="parallax"
      className={cn(
        "display pointer-events-none absolute z-0 select-none leading-none",
        variant === "stroke" ? "text-stroke-gold opacity-40" : "text-paper-3",
        side === "left" ? "-left-[0.18em]" : "-right-[0.18em]",
        anchor === "top" ? "-top-[0.1em]" : "-bottom-[0.12em]",
      )}
      style={{ fontSize: "clamp(14rem, 34vw, 30rem)" }}
    >
      {glyph}
    </span>
  );
}
