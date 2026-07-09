/**
 * Faithful above-the-fold recreation of the SimpleProjex (simpleprojex.com) hero.
 * Source: landing/components/features/sections/hero-section.tsx
 * Self-contained server component. Product's own palette + close font stacks.
 * No portfolio tokens, no next/font, no remote images. Rendered inside a 16:10
 * frame that is already a link — so nothing here is interactive.
 */

const SANS =
  'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

// Brand palette (SimpleProjex)
const BLUE = "#3B9EFB"; // brand primary
const BLUE_LIGHT = "#EBF4FE"; // brand light
const ORANGE = "#F0A62B"; // warm accent
const TEXT = "#2B2724"; // primary text
const MUTED = "#737373"; // secondary text

type Tool = {
  src: string;
  size: number;
  opacity: number;
  anim: string;
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
};

const TOOLS: Tool[] = [
  { src: "saw-svgrepo-com.svg", size: 360, top: -72, right: -56, opacity: 0.3, anim: "spx-spin 140s linear infinite" },
  { src: "hammer-svgrepo-com.svg", size: 300, bottom: -92, left: -88, opacity: 0.28, anim: "spx-spin-rev 160s linear infinite" },
  { src: "screwdriver-svgrepo-com.svg", size: 200, top: 190, left: 8, opacity: 0.26, anim: "spx-spin 200s linear infinite" },
  { src: "ruler-svgrepo-com.svg", size: 150, top: 26, left: "36%", opacity: 0.32, anim: "spx-spin 220s linear infinite" },
  { src: "shovel-svgrepo-com.svg", size: 210, bottom: -44, right: "29%", opacity: 0.3, anim: "spx-spin-rev 190s linear infinite" },
];

export function SimpleProjexShowcase() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        fontFamily: SANS,
        background:
          "linear-gradient(to bottom right, #ffffff 0%, rgba(235,244,254,0.3) 45%, rgba(235,244,254,0.5) 100%)",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes spx-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes spx-spin-rev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
@keyframes spx-pulse { 0%, 100% { transform: scale(1); opacity: .5; } 50% { transform: scale(1.14); opacity: .12; } }
`,
        }}
      />

      {/* Brand-blue radial mesh glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(59,158,251,0.12), transparent 60%), radial-gradient(circle at 72% 62%, rgba(59,158,251,0.08), transparent 60%)",
        }}
      />

      {/* Floating construction tools (behind everything, slow CSS rotate) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {TOOLS.map((t) => (
          <div
            key={t.src}
            style={{
              position: "absolute",
              width: t.size,
              height: t.size,
              top: t.top,
              bottom: t.bottom,
              left: t.left,
              right: t.right,
              opacity: t.opacity,
              backgroundImage: `url(/showcases/simpleprojex/${t.src})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              animation: t.anim,
            }}
          />
        ))}
      </div>

      {/* Content: two-column layout */}
      <div className="absolute inset-0 z-10 flex items-center px-14">
        <div className="grid w-full grid-cols-2 items-center gap-12">
          {/* LEFT: copy column */}
          <div className="flex flex-col gap-6">
            {/* Pill badge */}
            <div
              className="inline-flex w-fit items-center rounded-full border px-4 py-1.5 text-[13px] font-medium"
              style={{
                borderColor: "rgba(59,158,251,0.3)",
                backgroundColor: "rgba(235,244,254,0.85)",
                color: BLUE,
              }}
            >
              <span>🚀 From Estimates to Cash Flow</span>
            </div>

            {/* H1 */}
            <h1
              className="tracking-tight"
              style={{
                fontFamily: SERIF,
                fontWeight: 300,
                fontSize: 46,
                lineHeight: 1.1,
                color: TEXT,
              }}
            >
              Win More Construction Bids with
              <span className="block" style={{ color: BLUE }}>
                Smarter Proposals
              </span>
            </h1>

            {/* Subhead */}
            <p
              className="max-w-[52ch] text-[16px]"
              style={{ color: MUTED, lineHeight: 1.65 }}
            >
              Get live pricing built into proposals that are 10x faster using
              templates, with downloadable material lists and higher accuracy
              estimates connected to live Home Depot inventory.
            </p>

            {/* Email + CTA row */}
            <div className="flex w-full max-w-[480px] items-center gap-3">
              <div
                className="flex h-12 flex-1 items-center rounded-xl border bg-white px-4 text-[15px]"
                style={{ borderColor: "#E7E5E4", color: "#A3A3A3" }}
              >
                Enter your email
              </div>
              <div
                className="flex h-12 shrink-0 items-center gap-2 rounded-xl px-6 text-[15px] font-medium text-white"
                style={{
                  backgroundColor: BLUE,
                  boxShadow: "0 10px 15px -3px rgba(59,158,251,0.25)",
                }}
              >
                Get Started
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* RIGHT: macOS product-demo window mockup */}
          <div className="relative">
            <div
              className="overflow-hidden rounded-2xl border bg-white"
              style={{
                borderColor: "#EDEBEA",
                boxShadow: "0 25px 50px -12px rgba(20,40,80,0.25)",
              }}
            >
              {/* Title bar */}
              <div
                className="flex items-center gap-2 border-b px-4 py-3"
                style={{
                  borderColor: "#EDEBEA",
                  backgroundColor: "rgba(245,245,244,0.7)",
                }}
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#ff5f56" }} />
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#ffbd2e" }} />
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#27c93f" }} />
                <span className="ml-3 text-[12px] font-medium" style={{ color: MUTED }}>
                  Product Demo
                </span>
              </div>

              {/* Content area */}
              <div className="relative p-5">
                {/* Faint blue 28px grid */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(59,158,251,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(59,158,251,0.08) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                    opacity: 0.7,
                  }}
                />

                <div className="relative">
                  {/* Inner panel (holds toolbar + bento + play overlay) */}
                  <div
                    className="relative rounded-2xl border p-4"
                    style={{
                      borderColor: "#EDEBEA",
                      backgroundColor: "rgba(245,245,244,0.7)",
                    }}
                  >
                    {/* Chip toolbar row */}
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div
                        className="inline-flex items-center gap-1 rounded-full border bg-white/70 p-1"
                        style={{ borderColor: "#EDEBEA" }}
                      >
                        <span
                          className="rounded-full px-3 py-1 text-[12px] font-medium text-white"
                          style={{ backgroundColor: BLUE }}
                        >
                          All
                        </span>
                        <span className="rounded-full px-3 py-1 text-[12px] font-medium" style={{ color: MUTED }}>
                          Favorites
                        </span>
                        <span className="rounded-full px-3 py-1 text-[12px] font-medium" style={{ color: MUTED }}>
                          Recent
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="flex items-center gap-1.5 rounded-full border bg-white/80 px-3 py-1.5 text-[11px]"
                          style={{ borderColor: "#EDEBEA", color: MUTED }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <circle cx="11" cy="11" r="7" />
                            <path d="M21 21l-4-4" />
                          </svg>
                          <span>Search templates…</span>
                        </div>
                        <div
                          className="flex items-center gap-1 rounded-full border bg-white/80 p-1"
                          style={{ borderColor: "#EDEBEA", color: MUTED }}
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <rect x="3" y="3" width="7" height="7" rx="1.5" />
                              <rect x="14" y="3" width="7" height="7" rx="1.5" />
                              <rect x="3" y="14" width="7" height="7" rx="1.5" />
                              <rect x="14" y="14" width="7" height="7" rx="1.5" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bento of proposal placeholder cards */}
                    <div className="grid auto-rows-[66px] grid-cols-6 gap-3">
                      {/* Large primary */}
                      <div
                        className="relative col-span-4 row-span-2 flex flex-col rounded-xl border p-3"
                        style={{ backgroundColor: BLUE_LIGHT, borderColor: "rgba(59,158,251,0.18)" }}
                      >
                        <div
                          className="relative mb-2 flex-1 rounded-lg"
                          style={{ backgroundColor: "rgba(59,158,251,0.16)" }}
                        >
                          {/* subtle warm-orange favorite accent */}
                          <span className="absolute right-2 top-2">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill={ORANGE} aria-hidden="true">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                            </svg>
                          </span>
                        </div>
                        <div className="h-2.5 w-3/4 rounded-full" style={{ backgroundColor: "rgba(59,158,251,0.4)" }} />
                        <div className="mt-2 h-2 w-1/2 rounded-full" style={{ backgroundColor: "rgba(59,158,251,0.24)" }} />
                      </div>

                      {/* Support top-right */}
                      <div
                        className="col-span-2 row-span-1 flex items-center gap-2 rounded-xl border p-2.5"
                        style={{ backgroundColor: BLUE_LIGHT, borderColor: "rgba(59,158,251,0.18)" }}
                      >
                        <div className="h-full w-10 shrink-0 rounded-md" style={{ backgroundColor: "rgba(59,158,251,0.2)" }} />
                        <div className="flex-1">
                          <div className="h-2 w-full rounded-full" style={{ backgroundColor: "rgba(59,158,251,0.38)" }} />
                          <div className="mt-1.5 h-2 w-2/3 rounded-full" style={{ backgroundColor: "rgba(59,158,251,0.22)" }} />
                        </div>
                      </div>

                      {/* Support bottom-right */}
                      <div
                        className="col-span-2 row-span-1 flex items-center gap-2 rounded-xl border p-2.5"
                        style={{ backgroundColor: BLUE_LIGHT, borderColor: "rgba(59,158,251,0.18)" }}
                      >
                        <div className="h-full w-10 shrink-0 rounded-md" style={{ backgroundColor: "rgba(59,158,251,0.2)" }} />
                        <div className="flex-1">
                          <div className="h-2 w-full rounded-full" style={{ backgroundColor: "rgba(59,158,251,0.38)" }} />
                          <div className="mt-1.5 h-2 w-1/2 rounded-full" style={{ backgroundColor: "rgba(59,158,251,0.22)" }} />
                        </div>
                      </div>
                    </div>

                    {/* Centered circular play button overlay */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="relative flex flex-col items-center gap-3">
                        <span
                          className="absolute -inset-5 rounded-full border"
                          style={{ borderColor: "rgba(59,158,251,0.4)", animation: "spx-pulse 3.5s ease-in-out infinite" }}
                        />
                        <span
                          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white"
                          style={{ boxShadow: "0 20px 40px -8px rgba(20,40,80,0.35)", border: "1px solid #EDEBEA" }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill={BLUE} aria-hidden="true">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                        <span
                          className="rounded-full bg-white/95 px-4 py-1.5 text-[13px] font-semibold"
                          style={{ color: BLUE, boxShadow: "0 8px 16px -6px rgba(20,40,80,0.25)" }}
                        >
                          Watch Demo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action bar */}
                  <div
                    className="mt-4 flex items-center justify-between rounded-2xl border bg-white/70 px-3 py-2"
                    style={{ borderColor: "#EDEBEA" }}
                  >
                    <span className="text-[12px]" style={{ color: MUTED }}>
                      3 recent proposals updated
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full px-3 py-1 text-[12px]" style={{ color: MUTED }}>
                        Import
                      </span>
                      <span
                        className="flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium text-white"
                        style={{ backgroundColor: BLUE }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        New Proposal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
