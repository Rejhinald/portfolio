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
 *
 * Structure: the OUTER span carries the reveal + the stamp bleed ring
 * (box-shadow) and stays unmasked; the INNER span carries the shu fill, glyph,
 * and dry-ink mask — masking an element clips its box-shadow, so the ring must
 * live outside the mask.
 */
export function Hanko({
  glyph,
  size = 44,
  shape = "square",
  animate = true,
  className,
}: HankoProps) {
  const isTag = shape === "tag";
  const radius = Math.max(4, size * 0.14);
  return (
    <span
      data-animate={animate ? "hanko" : undefined}
      aria-hidden
      className={cn("inline-block select-none", className)}
      style={{ rotate: "-4deg", borderRadius: radius }}
    >
      <span
        className="display flex items-center justify-center bg-shu text-paper"
        style={{
          width: isTag ? undefined : size,
          height: size,
          padding: isTag ? `0 ${size * 0.22}px` : undefined,
          borderRadius: radius,
          fontSize: isTag ? size * 0.42 : size * 0.52,
          lineHeight: 1,
          letterSpacing: isTag ? "0.1em" : undefined,
          maskImage:
            "radial-gradient(120% 120% at 30% 30%, black 55%, rgba(0,0,0,0.82) 78%, rgba(0,0,0,0.62) 100%)",
          WebkitMaskImage:
            "radial-gradient(120% 120% at 30% 30%, black 55%, rgba(0,0,0,0.82) 78%, rgba(0,0,0,0.62) 100%)",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      >
        {glyph}
      </span>
    </span>
  );
}
