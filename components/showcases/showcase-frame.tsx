import { ArrowUpRight } from "lucide-react";
import type { Showcase } from "@/lib/data/showcases";
import { cn } from "@/lib/utils";

export function ShowcaseFrame({
  name,
  role,
  year,
  stack,
  href,
  domain,
  captionClassName,
  children,
}: Omit<Showcase, "key"> & {
  /** Hide/show the caption per layout (e.g. when a rail or band carries the meta). */
  captionClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${name} (opens in new tab)`}
      className="group block"
    >
      <div className="overflow-hidden rounded-xl border border-rule bg-paper-2 shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-rule bg-paper-3 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-shu/70" />
          <span className="h-3 w-3 rounded-full bg-gold/70" />
          <span className="h-3 w-3 rounded-full bg-wakaba/70" />
          <span className="ml-3 truncate rounded bg-paper px-3 py-1 text-xs text-ink-mid">
            {domain}
          </span>
        </div>
        {/* Screen — the recreation fills this. Decorative: its fake headings
            and faux fields are hidden from assistive tech (the anchor's
            aria-label names the link). */}
        <div
          className="relative aspect-[16/10] w-full overflow-hidden bg-white"
          aria-hidden="true"
        >
          {children}
          <span className="pointer-events-none absolute right-4 top-4 z-20 inline-flex items-center gap-1 rounded-full bg-ink/85 px-3 py-1.5 text-xs text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Visit site <ArrowUpRight size={13} />
          </span>
        </div>
      </div>
      {/* Portfolio caption */}
      <div className={cn(captionClassName)}>
        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="display type-card-title text-ink">{name}</h3>
          <span className="text-sm text-ink-mid">
            {role} · {year}
          </span>
        </div>
        <p className="mt-1 text-sm text-stone">{stack}</p>
      </div>
    </a>
  );
}
