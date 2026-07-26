"use client";

import { useState } from "react";
import { Play, ArrowUpRight, Github } from "lucide-react";
import type { ArchiveItem as Item } from "@/lib/data/archive";

export function ArchiveItem({ item }: { item: Item }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-rule bg-paper-2">
      <div className="relative aspect-video w-full overflow-hidden bg-ink">
        {!item.youtubeId ? (
          // No demo video — static poster linking straight to the live site.
          <a
            href={item.liveHref}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 block h-full w-full"
            aria-label={`Open ${item.title} (opens in new tab)`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt=""
              className="h-full w-full object-cover object-top opacity-95 transition group-hover:opacity-100"
              loading="lazy"
            />
            <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-shu text-paper shadow-lg transition group-hover:scale-110">
              <ArrowUpRight size={16} />
            </span>
          </a>
        ) : playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
            title={`${item.title} demo`}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 h-full w-full"
            aria-label={`Play ${item.title} demo`}
          >
            {/* Poster facade — no video loads until clicked */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`}
              alt=""
              className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
              loading="lazy"
            />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-shu text-paper shadow-lg transition group-hover:scale-110">
                <Play size={22} className="translate-x-0.5" fill="currentColor" />
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="display text-lg text-ink">{item.title}</h3>
          <span className="text-xs text-stone">{item.year}</span>
        </div>
        <p className="mt-2 flex-1 text-sm text-ink-mid">{item.blurb}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tech.map((t) => (
            <span
              key={t}
              className="rounded border border-rule px-2 py-0.5 text-[11px] text-ink-mid"
            >
              {t}
            </span>
          ))}
        </div>
        {(item.liveHref || item.githubHref) && (
          <div className="mt-4 flex gap-4 text-sm">
            {item.liveHref && (
              <a
                href={item.liveHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-ink transition-colors hover:text-shu"
              >
                Live <ArrowUpRight size={14} />
              </a>
            )}
            {item.githubHref && (
              <a
                href={item.githubHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-ink transition-colors hover:text-shu"
              >
                Code <Github size={14} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
