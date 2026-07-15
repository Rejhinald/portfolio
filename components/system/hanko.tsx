import { cn } from "@/lib/utils";

type HankoProps = {
  glyph: string;
  size?: number;
  shape?: "square" | "tag";
  /** Skip the stamp-in reveal (e.g. footer, where it should just be there). */
  animate?: boolean;
  className?: string;
};

/**
 * The site's single hanko (seal) system — shu rounded square, paper glyph in
 * the display face, slight rotation, dry-ink edge via a radial mask. Every
 * seal on the site renders through this component (seal budget: one system).
 */
export function Hanko({
  glyph,
  size = 44,
  shape = "square",
  animate = true,
  className,
}: HankoProps) {
  const isTag = shape === "tag";
  return (
    <span
      data-animate={animate ? "hanko" : undefined}
      aria-hidden
      className={cn(
        "display inline-flex select-none items-center justify-center bg-shu text-paper",
        className,
      )}
      style={{
        width: isTag ? undefined : size,
        height: size,
        padding: isTag ? `0 ${size * 0.22}px` : undefined,
        borderRadius: Math.max(4, size * 0.14),
        rotate: "-4deg",
        fontSize: isTag ? size * 0.42 : size * 0.52,
        lineHeight: 1,
        letterSpacing: isTag ? "0.1em" : undefined,
        maskImage:
          "radial-gradient(120% 120% at 30% 30%, black 55%, rgba(0,0,0,0.82) 78%, rgba(0,0,0,0.62) 100%)",
        WebkitMaskImage:
          "radial-gradient(120% 120% at 30% 30%, black 55%, rgba(0,0,0,0.82) 78%, rgba(0,0,0,0.62) 100%)",
      }}
    >
      {glyph}
    </span>
  );
}
