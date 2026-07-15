/**
 * Kohaze Rule — the section seam: an off-center interrupted rule whose gap
 * holds a shu tick + the section's formal kanji numeral, with a gold dotted
 * leader running out to the right margin.
 */
export function SectionRule({ numeral }: { numeral: string }) {
  return (
    <div aria-hidden className="wa-container flex items-center gap-4 py-2">
      <span className="h-px w-[12%] shrink-0 bg-rule lg:w-[22%]" />
      <span className="flex shrink-0 items-center gap-2">
        <span className="h-1.5 w-1.5 bg-shu" />
        <span className="display text-xs text-stone">{numeral}</span>
      </span>
      <span className="h-px flex-1 bg-rule" />
      <span className="hidden w-[10%] border-b border-dotted border-gold/70 lg:block" />
    </div>
  );
}
