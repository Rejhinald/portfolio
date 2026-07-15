/**
 * Tokonoma Frame — persistent viewport chrome that mounts the whole page like
 * a framed print: sumi ink border + inner gold hairline (desktop), a vertical
 * tanzaku label bottom-left, and a shu tick top-right. Pure decoration.
 */
export function TokonomaFrame() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden>
      {/* Outer sumi border */}
      <div className="absolute inset-2 border-[1.5px] border-ink/70 lg:inset-3" />
      {/* Inner gold hairline (desktop only) */}
      <div className="absolute hidden border border-gold/50 lg:block lg:inset-[calc(0.75rem+5px)]" />
      {/* Shu tick, top-right */}
      <span className="absolute right-5 top-5 hidden h-1.5 w-1.5 bg-shu lg:block" />
      {/* Tanzaku label, bottom-left */}
      <span
        className="absolute bottom-8 left-[1.4rem] hidden bg-paper/85 px-0.5 py-2 text-[10px] tracking-[0.3em] text-ink-mid lg:block"
        style={{ writingMode: "vertical-rl" }}
      >
        大阪 · OSAKA — 二〇二六
      </span>
    </div>
  );
}
