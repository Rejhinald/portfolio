// Avorino (avorino.com) — editorial-luxury construction / ADU brand.
// Faithful mini-recreation of the above-the-fold hero for the portfolio
// "Selected Work" gallery. Server component, fully self-contained: no
// hooks, no next/font, no remote images. The real hero uses a muted
// full-bleed MP4 background; here it's replaced with a static warm-dark
// stage (radial + linear gradients) plus the site's faint blueprint
// corner mark. Copy, palette, and layout are pulled from the source
// hero (src/components/sections/hero.tsx) and avorino-home.css, using the
// CMS fallback strings from src/lib/cms-home.ts.
//
// All sizing is expressed in `cqw` against a ~1200x750 reference so the
// panel scales proportionally at any rendered width (the root establishes
// the query container).

const DISPLAY = 'Georgia, "Times New Roman", serif';
const BODY = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const CREAM = "#F0EDE8";
const CREAM_78 = "rgba(240,237,232,0.78)";
const CREAM_55 = "rgba(240,237,232,0.55)";
const CREAM_45 = "rgba(240,237,232,0.45)";
const GOLD = "#C9A96E";
const INK = "#111111";

export function AvorinoShowcase() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        containerType: "inline-size",
        backgroundColor: "#0a0a0a",
        padding: "1.4cqw",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes avsScrollDot {
  0%   { transform: translateY(-1cqw); opacity: 0; }
  18%  { opacity: 1; }
  82%  { opacity: 1; }
  100% { transform: translateY(3.3cqw); opacity: 0; }
}
@keyframes avsFadeUp {
  from { opacity: 0; transform: translateY(1.3cqw); }
  to   { opacity: 1; transform: translateY(0); }
}
.avs-lockup { animation: avsFadeUp 0.9s cubic-bezier(0.23,1,0.32,1) both; }
.avs-dot { animation: avsScrollDot 2.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .avs-lockup { animation: none; }
  .avs-dot { animation: none; opacity: 0.6; }
}
`,
        }}
      />

      {/* ── Inset stage (the rounded dark "screen") ── */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: "0.8cqw",
          backgroundColor: "#14110E",
          boxShadow: "inset 0 0 0 1px rgba(240,237,232,0.06)",
        }}
      >
        {/* Still frame from the real hero's background footage */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/showcases/avorino/hero-still.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.85,
          }}
        />
        {/* Warm radial highlight, top-right (stands in for video light) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 115% at 74% 16%, rgba(96,80,58,0.35) 0%, rgba(38,31,24,0.12) 42%, rgba(20,17,14,0) 62%)",
          }}
        />
        {/* Faint full-bleed blueprint grid texture */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(240,237,232,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(240,237,232,0.028) 1px, transparent 1px)",
            backgroundSize: "3.2cqw 3.2cqw",
          }}
        />
        {/* Legibility wash — darken bottom + left where the lockup sits */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,9,7,0) 30%, rgba(10,9,7,0.45) 68%, rgba(7,6,4,0.82) 100%), linear-gradient(90deg, rgba(7,6,4,0.6) 0%, rgba(10,9,7,0) 46%)",
          }}
        />

        {/* ── Blueprint corner mark (top-right), from source hero.tsx ── */}
        <svg
          className="absolute"
          style={{ top: "2.2cqw", right: "2.2cqw", width: "12.5cqw", height: "12.5cqw" }}
          viewBox="0 0 180 180"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <pattern id="avsBpGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" stroke="rgba(240,237,232,0.18)" strokeWidth="0.6" fill="none" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="180" height="180" fill="url(#avsBpGrid)" />
          <path d="M10 10 H40 M10 10 V40" stroke="rgba(240,237,232,0.45)" strokeWidth="1.2" />
          <path d="M170 170 H140 M170 170 V140" stroke="rgba(240,237,232,0.45)" strokeWidth="1.2" />
          <circle cx="90" cy="90" r="3" fill="rgba(200,34,42,0.65)" />
        </svg>

        {/* ── Bottom-left lockup ── */}
        <div
          className="avs-lockup absolute flex flex-col items-start"
          style={{ bottom: "4.6cqw", left: "4.6cqw", right: "4.6cqw", gap: "1.5cqw" }}
        >
          {/* Trust badges */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.6cqw",
              fontFamily: BODY,
              fontSize: "0.92cqw",
              color: CREAM_78,
            }}
          >
            {[
              "Licensed · B #1107538",
              "4.8★ · 35+ reviews",
              "7+ yrs · 34+ OC cities",
            ].map((t) => (
              <span
                key={t}
                style={{
                  border: `0.07cqw solid ${CREAM_45}`,
                  borderRadius: "999px",
                  padding: "0.4cqw 1cqw",
                  whiteSpace: "nowrap",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Eyebrow */}
          <div
            style={{
              fontFamily: BODY,
              fontSize: "1.02cqw",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: CREAM_55,
            }}
          >
            Avorino · Orange County
          </div>

          {/* Gold hairline */}
          <div style={{ width: "4.7cqw", height: "0.14cqw", backgroundColor: GOLD }} />

          {/* Headline (serif) with italic emphasis on the second line */}
          <h1
            style={{
              margin: 0,
              fontFamily: DISPLAY,
              fontSize: "4cqw",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              color: CREAM,
              maxWidth: "18ch",
            }}
          >
            <span style={{ display: "block" }}>You Envision It.</span>
            <span style={{ display: "block", fontStyle: "italic", fontWeight: 400 }}>
              Avorino Builds It.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              margin: "0.3cqw 0 0",
              fontFamily: BODY,
              fontSize: "1.33cqw",
              lineHeight: 1.6,
              color: CREAM_78,
              maxWidth: "46cqw",
            }}
          >
            One accountable partner from start to finish. Avorino manages the
            process, coordinates the trades, and delivers the project with clarity
            from day one to final handoff.
          </p>

          {/* CTA row: cream estimate pill + call pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1cqw",
              marginTop: "0.5cqw",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.7cqw",
                backgroundColor: CREAM,
                color: INK,
                fontFamily: BODY,
                fontSize: "1.25cqw",
                fontWeight: 500,
                letterSpacing: "0.04em",
                padding: "1.15cqw 2.5cqw",
                borderRadius: "999px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              Get a Free Estimate
              <span style={{ display: "inline-block", fontSize: "1.35cqw", lineHeight: 1 }}>→</span>
              {/* Gold hover rule from the real .btn-pill, shown as a static hairline hint */}
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  height: "0.16cqw",
                  width: "34%",
                  backgroundColor: GOLD,
                }}
              />
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: `0.09cqw solid ${CREAM_45}`,
                color: CREAM,
                fontFamily: BODY,
                fontSize: "1.25cqw",
                fontWeight: 500,
                letterSpacing: "0.04em",
                padding: "1.05cqw 2.2cqw",
                borderRadius: "999px",
              }}
            >
              Call (714) 900-3676
            </div>
          </div>

          {/* Free ROI estimate link */}
          <div
            style={{
              fontFamily: BODY,
              fontSize: "1.05cqw",
              color: CREAM_78,
              marginTop: "0.2cqw",
              borderBottom: `0.08cqw solid ${GOLD}`,
              paddingBottom: "0.25cqw",
            }}
          >
            See what an ADU adds to your property — free ROI estimate→
          </div>
        </div>

        {/* ── Scroll indicator (bottom-center) ── */}
        <div
          className="absolute flex flex-col items-center"
          style={{ bottom: "2.4cqw", left: "50%", transform: "translateX(-50%)", gap: "0.7cqw" }}
        >
          <span
            style={{
              fontFamily: BODY,
              fontSize: "0.85cqw",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: CREAM_45,
            }}
          >
            Scroll
          </span>
          <div
            style={{
              position: "relative",
              width: "1px",
              height: "3.3cqw",
              backgroundColor: "rgba(240,237,232,0.14)",
              overflow: "hidden",
            }}
          >
            <div
              className="avs-dot"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "1px",
                height: "1cqw",
                backgroundColor: "rgba(240,237,232,0.6)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
