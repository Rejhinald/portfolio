/**
 * NexwinShowcase — faithful above-the-fold recreation of the Nexwin Capital
 * (nexwincapital.com) home hero: a dark editorial lockup over the gold
 * "capital-flow + construction blueprint" scene.
 *
 * The live site renders that scene in three.js (see the source project's
 * `hero-canvas.tsx`). Here it is rebuilt as a LIGHTWEIGHT STATIC stand-in
 * with inline SVG + CSS only — a faint blueprint perspective grid, blue
 * wireframe skyline + construction crane, and a bright-gold step-up growth
 * chart with node dots and one CSS-animated pulse travelling the line.
 *
 * Server component. No 'use client', no next/image, no Link (the parent
 * panel is already the anchor). Colours/fonts are inline & self-contained,
 * pulled from the product's own tokens — cream #E8E4DF, ink #111,
 * gold #B5945A / #E7C074, navy #0B1220 — not the portfolio's tokens.
 */
export function NexwinShowcase() {
  // ── Blueprint perspective grid (generated toward a vanishing point) ──
  const VPX = 884;
  const VPY = 300;
  const FLOOR_Y = 750;
  const depthXs: number[] = [];
  for (let bx = -380; bx <= 1580; bx += 150) depthXs.push(bx);
  const horizT = [0, 0.12, 0.23, 0.33, 0.42, 0.5, 0.58, 0.66, 0.73, 0.8, 0.86, 0.92];

  // ── Wireframe skyline (blue, one gold "funded" accent) ──
  const buildings = [
    { x: 806, baseY: 404, w: 54, h: 150, ox: 15, oy: -11, accent: false },
    { x: 866, baseY: 416, w: 62, h: 214, ox: 17, oy: -12, accent: false },
    { x: 940, baseY: 402, w: 46, h: 126, ox: 13, oy: -10, accent: true },
    { x: 996, baseY: 422, w: 66, h: 250, ox: 19, oy: -13, accent: false },
    { x: 1074, baseY: 408, w: 44, h: 116, ox: 12, oy: -9, accent: false },
  ];

  // ── Capital-flow "growth chart" — 4 gold node anchors, stepping up ──
  const nodes = [
    { x: 628, y: 486 },
    { x: 772, y: 430 },
    { x: 930, y: 336 },
    { x: 1096, y: 232 },
  ];
  const BASELINE_Y = 548;
  const chartPoints = nodes.map((n) => `${n.x},${n.y}`).join(" ");

  // ── Construction crane lattice mast rungs ──
  const rungY = [430, 397, 364, 331, 298, 265, 232, 199, 166, 133];

  // ── Ambient gold dust ──
  const dust = [
    { x: 690, y: 250, r: 1.6, d: "0s" },
    { x: 840, y: 208, r: 1.2, d: "1.2s" },
    { x: 1012, y: 178, r: 1.8, d: "2.1s" },
    { x: 1146, y: 300, r: 1.3, d: "0.6s" },
    { x: 966, y: 424, r: 1.5, d: "2.6s" },
    { x: 726, y: 150, r: 1.1, d: "0.3s" },
    { x: 1160, y: 470, r: 1.5, d: "1.5s" },
    { x: 880, y: 470, r: 1.2, d: "3.1s" },
  ];

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: "#0B1220",
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* ── The blueprint scene (kept to the right so text stays clear) ── */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 750"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="nexwinGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E7C074" stopOpacity="0.15" />
            <stop offset="55%" stopColor="#B5945A" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#0B1220" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* warm atmosphere behind the skyline */}
        <ellipse cx="952" cy="320" rx="440" ry="300" fill="url(#nexwinGlow)" />

        {/* blueprint perspective grid */}
        <g>
          {depthXs.map((bx, i) => (
            <line
              key={`d${i}`}
              x1={bx}
              y1={FLOOR_Y}
              x2={VPX}
              y2={VPY}
              stroke={i % 3 === 0 ? "#3f5a86" : "#2b4066"}
              strokeWidth={i % 3 === 0 ? 1 : 0.8}
              opacity={i % 3 === 0 ? 0.26 : 0.15}
            />
          ))}
          {horizT.map((t, i) => {
            const y = FLOOR_Y - t * (FLOOR_Y - VPY);
            const lx = -380 + t * (VPX + 380);
            const rx = 1580 + t * (VPX - 1580);
            const major = i % 2 === 0;
            return (
              <line
                key={`h${i}`}
                x1={lx}
                y1={y}
                x2={rx}
                y2={y}
                stroke={major ? "#3f5a86" : "#2b4066"}
                strokeWidth={major ? 1 : 0.8}
                opacity={major ? 0.26 : 0.15}
              />
            );
          })}
        </g>

        {/* wireframe skyline */}
        <g strokeLinejoin="round" strokeLinecap="round">
          {buildings.map((b, i) => {
            const stroke = b.accent ? "#B5945A" : "#4a6892";
            const op = b.accent ? 0.9 : 0.72;
            const top = b.baseY - b.h;
            const floors = Math.max(2, Math.round(b.h / 34));
            const wins = Array.from({ length: floors }, (_, k) => {
              const wy = top + ((k + 1) * b.h) / (floors + 1);
              return (
                <line
                  key={`w${i}-${k}`}
                  x1={b.x + 6}
                  y1={wy}
                  x2={b.x + b.w - 6}
                  y2={wy}
                  stroke={stroke}
                  strokeWidth={0.7}
                  opacity={op * 0.5}
                />
              );
            });
            return (
              <g key={`b${i}`} fill="none">
                <rect
                  x={b.x}
                  y={top}
                  width={b.w}
                  height={b.h}
                  fill="rgba(11,18,32,0.32)"
                  stroke={stroke}
                  strokeWidth={1.2}
                  opacity={op}
                />
                <path
                  d={`M${b.x},${top} L${b.x + b.ox},${top + b.oy} L${b.x + b.w + b.ox},${top + b.oy} L${b.x + b.w},${top}`}
                  stroke={stroke}
                  strokeWidth={1.1}
                  opacity={op * 0.9}
                />
                <line
                  x1={b.x + b.w}
                  y1={top}
                  x2={b.x + b.w + b.ox}
                  y2={top + b.oy}
                  stroke={stroke}
                  strokeWidth={1.1}
                  opacity={op * 0.9}
                />
                <line
                  x1={b.x + b.w}
                  y1={b.baseY}
                  x2={b.x + b.w + b.ox}
                  y2={b.baseY + b.oy}
                  stroke={stroke}
                  strokeWidth={1.1}
                  opacity={op * 0.7}
                />
                <line
                  x1={b.x + b.w + b.ox}
                  y1={top + b.oy}
                  x2={b.x + b.w + b.ox}
                  y2={b.baseY + b.oy}
                  stroke={stroke}
                  strokeWidth={1.1}
                  opacity={op * 0.8}
                />
                {wins}
              </g>
            );
          })}

          {/* construction crane */}
          <g stroke="#4a6892" strokeWidth={1.2} fill="none" opacity={0.8}>
            {/* mast verticals */}
            <line x1={1112} y1={430} x2={1112} y2={126} />
            <line x1={1128} y1={430} x2={1128} y2={126} />
            {/* rungs */}
            {rungY.map((y, i) => (
              <line key={`cr${i}`} x1={1112} y1={y} x2={1128} y2={y} strokeWidth={1} />
            ))}
            {/* cross bracing (alternating diagonals) */}
            {rungY.slice(0, -1).map((y, i) =>
              i % 2 === 0 ? (
                <line
                  key={`cx${i}`}
                  x1={1112}
                  y1={y}
                  x2={1128}
                  y2={rungY[i + 1]}
                  strokeWidth={0.8}
                  opacity={0.7}
                />
              ) : (
                <line
                  key={`cx${i}`}
                  x1={1128}
                  y1={y}
                  x2={1112}
                  y2={rungY[i + 1]}
                  strokeWidth={0.8}
                  opacity={0.7}
                />
              ),
            )}
            {/* apex + tie-bars */}
            <line x1={1120} y1={126} x2={1120} y2={104} />
            <line x1={1120} y1={104} x2={984} y2={138} strokeWidth={0.9} />
            <line x1={1120} y1={104} x2={1052} y2={138} strokeWidth={0.9} />
            <line x1={1120} y1={104} x2={1176} y2={138} strokeWidth={0.9} />
            {/* jib (arm reaching left over the site) */}
            <line x1={984} y1={138} x2={1120} y2={138} />
            <line x1={996} y1={154} x2={1120} y2={154} />
            <line x1={984} y1={138} x2={996} y2={154} />
            {[1008, 1036, 1064, 1092].map((x, i) => (
              <line
                key={`jt${i}`}
                x1={x}
                y1={138}
                x2={x - 12}
                y2={154}
                strokeWidth={0.8}
                opacity={0.7}
              />
            ))}
            {/* counter-jib + counterweight */}
            <line x1={1128} y1={138} x2={1176} y2={138} />
            <line x1={1128} y1={154} x2={1170} y2={154} />
            <rect x={1164} y={154} width={16} height={17} strokeWidth={1} />
            {/* hoist cable + gold hook block */}
            <line x1={1024} y1={154} x2={1024} y2={250} strokeWidth={0.9} />
            <rect
              x={1018}
              y={250}
              width={12}
              height={9}
              stroke="#E7C074"
              strokeWidth={1}
              opacity={0.85}
            />
          </g>
        </g>

        {/* capital-flow growth chart */}
        <g>
          {/* baseline (x-axis) */}
          <line
            x1={616}
            y1={BASELINE_Y}
            x2={1140}
            y2={BASELINE_Y}
            stroke="#7a5e30"
            strokeWidth={1}
            strokeDasharray="3 5"
            opacity={0.5}
          />
          {/* drop-lines to baseline */}
          {nodes.map((n, i) => (
            <line
              key={`dl${i}`}
              x1={n.x}
              y1={BASELINE_Y}
              x2={n.x}
              y2={n.y}
              stroke="#7a5e30"
              strokeWidth={1}
              strokeDasharray="3 5"
              opacity={0.55}
            />
          ))}
          {/* path — soft glow then bright line */}
          <polyline
            points={chartPoints}
            fill="none"
            stroke="#E7C074"
            strokeWidth={7}
            opacity={0.14}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={chartPoints}
            fill="none"
            stroke="#E7C074"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* gold node dots */}
          {nodes.map((n, i) => (
            <g key={`nd${i}`}>
              <circle cx={n.x} cy={n.y} r={9} fill="none" stroke="#E7C074" strokeWidth={1} opacity={0.4} />
              <circle cx={n.x} cy={n.y} r={5.5} fill="#B5945A" stroke="#E7C074" strokeWidth={1.5} />
              <circle cx={n.x} cy={n.y} r={2} fill="#F3DFB0" />
            </g>
          ))}
          {/* one pulse dot travelling the chart */}
          <circle className="nexwin-pulse" r={4.5} fill="#F3DFB0" />
        </g>

        {/* ambient dust */}
        <g fill="#B5945A">
          {dust.map((p, i) => (
            <circle
              key={`du${i}`}
              className="nexwin-dust"
              cx={p.x}
              cy={p.y}
              r={p.r}
              style={{ animationDelay: p.d }}
            />
          ))}
        </g>
      </svg>

      {/* ── Legibility scrims (dark toward the bottom-left lockup) ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top right, rgba(11,18,32,0.97) 0%, rgba(11,18,32,0.86) 20%, rgba(11,18,32,0.4) 47%, rgba(11,18,32,0) 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(11,18,32,0.9) 0%, rgba(11,18,32,0.15) 34%, rgba(11,18,32,0) 55%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(11,18,32,0.55) 0%, rgba(11,18,32,0) 20%)",
        }}
      />

      {/* ── Bottom-left editorial lockup ── */}
      <div className="absolute" style={{ left: 56, bottom: 58, maxWidth: 640 }}>
        {/* eyebrow */}
        <p
          style={{
            margin: 0,
            maxWidth: 560,
            color: "rgba(232,228,223,0.65)",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.3em",
            lineHeight: 1.5,
            textTransform: "uppercase",
          }}
        >
          Orange County-founded · California-licensed loan broker · Real estate
          capital for investors, builders, and business owners
        </p>

        {/* 56px gold hairline */}
        <div
          style={{
            width: 56,
            height: 1,
            backgroundColor: "#B5945A",
            marginTop: 20,
            marginBottom: 22,
          }}
        />

        {/* H1 — serif display lockup */}
        <h1
          style={{
            margin: 0,
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: "#E8E4DF",
            fontSize: 58,
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          <span style={{ display: "block" }}>Funding</span>
          <span style={{ display: "block" }}>
            your{" "}
            <span style={{ fontWeight: 300, fontStyle: "italic" }}>Next Win.</span>
          </span>
        </h1>

        {/* subhead */}
        <p
          style={{
            margin: 0,
            marginTop: 22,
            maxWidth: 500,
            color: "rgba(232,228,223,0.68)",
            fontSize: 18,
            lineHeight: 1.5,
            fontWeight: 400,
          }}
        >
          Real estate capital that moves when you do — packaged across our lender
          network so you get terms that actually fit the deal.
        </p>

        {/* cream pill CTA (visual only — the panel itself is the link) */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginTop: 28,
            backgroundColor: "#E8E4DF",
            color: "#111111",
            borderRadius: 999,
            padding: "14px 30px",
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
          }}
        >
          Find your fit · 2 min
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111111"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      </div>

      <style>{`
        .nexwin-pulse {
          transform: translate(628px, 486px);
          opacity: 0;
          will-change: transform, opacity;
          filter: drop-shadow(0 0 4px #E7C074) drop-shadow(0 0 9px rgba(231,192,116,0.55));
          animation: nexwin-pulse-move 4.6s linear infinite;
        }
        @keyframes nexwin-pulse-move {
          0%   { transform: translate(628px, 486px); opacity: 0; }
          6%   { opacity: 1; }
          33%  { transform: translate(772px, 430px); opacity: 1; }
          66%  { transform: translate(930px, 336px); opacity: 1; }
          94%  { opacity: 1; }
          100% { transform: translate(1096px, 232px); opacity: 0; }
        }
        .nexwin-dust {
          opacity: 0.3;
          animation: nexwin-twinkle 5s ease-in-out infinite;
        }
        @keyframes nexwin-twinkle {
          0%, 100% { opacity: 0.18; }
          50%      { opacity: 0.55; }
        }
        @media (prefers-reduced-motion: reduce) {
          .nexwin-pulse { animation: none; opacity: 0; }
          .nexwin-dust { animation: none; }
        }
      `}</style>
    </div>
  );
}
