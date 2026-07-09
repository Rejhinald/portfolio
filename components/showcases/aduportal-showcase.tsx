import type { CSSProperties, ReactNode } from "react";

/**
 * AduPortalShowcase — faithful visual recreation of the ADUPortal (aduportal.com)
 * above-the-fold hero. Self-contained server component: no external fonts, no
 * next/image, no portfolio tokens, no interactivity (the parent panel is already
 * a link). Sizes are expressed in container-query width units so the whole
 * 1200x750 reference composition scales to any width of the 16/10 frame.
 */

// px (at the 1200px reference width) -> cqw string. 1cqw = 12px at 1200px.
const u = (px: number) => `${(px / 12).toFixed(3)}cqw`;

const C = {
  primary: "#073f42",
  accent: "#15927f",
  lime: "#dbffc2",
  ink: "#202728",
  muted: "#5d6868",
  subtle: "#8d9998",
  border: "#dfe7e3",
  amber: "#f0b429",
  success: "#2f9a80",
  white: "#ffffff",
};

type IconProps = { size: string; style?: CSSProperties; fill?: boolean; sw?: number };

function Svg({
  size,
  style,
  fill = false,
  sw = 1.8,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: size, height: size, display: "block", flex: "none", ...style }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const IHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 22V12h6v10" />
  </Svg>
);
const ICheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21.8 10A10 10 0 1 1 17 3.34" />
    <path d="m9 11 3 3L22 4" />
  </Svg>
);
const ICalc = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8" />
    <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14v4M8 18h.01M12 18h.01" />
  </Svg>
);
const ISparkle = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.13 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z" />
  </Svg>
);
const IWrench = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </Svg>
);
const IArrow = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </Svg>
);
const IMap = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.1 5.55a2 2 0 0 0 1.8 0l3.65-1.83A1 1 0 0 1 21 4.62v12.76a1 1 0 0 1-.55.9l-4.55 2.27a2 2 0 0 1-1.8 0l-4.2-2.1a2 2 0 0 0-1.8 0l-3.65 1.83A1 1 0 0 1 3 19.38V6.62a1 1 0 0 1 .55-.9L8.1 3.45a2 2 0 0 1 1.8 0z" />
    <path d="M15 5.76v15" />
    <path d="M9 3.24v15" />
  </Svg>
);
const IFile = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </Svg>
);
const ILine = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="m19 9-5 5-4-4-3 3" />
  </Svg>
);
const IStar = (p: IconProps) => (
  <Svg {...p} fill>
    <path d="M11.5 2.3a.5.5 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.75a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.9l5.16-.76a2.12 2.12 0 0 0 1.6-1.16z" />
  </Svg>
);

function pill(bg: string, color: string, border?: string): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: u(40),
    padding: `0 ${u(22)}`,
    borderRadius: u(999),
    fontSize: u(13),
    fontWeight: 700,
    color,
    background: bg,
    border: border ? `1px solid ${border}` : "1px solid transparent",
    whiteSpace: "nowrap",
    boxShadow: bg === C.primary ? `0 ${u(12)} ${u(26)} rgba(7,63,66,0.28)` : "none",
  };
}

const cardShadow = `0 ${u(26)} ${u(60)} rgba(4,31,34,0.24)`;
const softShadow = `0 ${u(22)} ${u(50)} rgba(4,31,34,0.16)`;

// (a) Deep-teal "Vision locked / Detached ADU" — stylized ADU scene + home badge
function CardVision() {
  return (
    <div
      style={{
        position: "relative",
        height: u(214),
        borderRadius: u(12),
        overflow: "hidden",
        transform: "rotate(-1deg)",
        background: C.primary,
        boxShadow: cardShadow,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,#0c5054 0%,#073f42 52%,#032a2c 100%)",
        }}
      />
      <svg
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: "absolute", top: u(6), left: 0, width: "100%", height: u(120) }}
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke="rgba(219,255,194,0.55)"
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path d="M36 66 L100 30 L164 66" />
          <rect x="52" y="66" width="96" height="44" rx="2" />
          <rect x="66" y="80" width="18" height="16" />
          <rect
            x="116"
            y="80"
            width="18"
            height="30"
            fill="rgba(219,255,194,0.14)"
          />
        </g>
        <path d="M16 110 H184" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "62%",
          background:
            "linear-gradient(180deg,rgba(4,31,34,0) 0%,rgba(4,31,34,0.74) 100%)",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: u(12),
          left: u(12),
          width: u(30),
          height: u(30),
          borderRadius: "50%",
          background: "rgba(255,255,255,0.9)",
          color: C.primary,
          display: "grid",
          placeItems: "center",
          boxShadow: `0 ${u(10)} ${u(24)} rgba(4,31,34,0.18)`,
          animation: "adup-float 4.2s ease-in-out infinite",
        }}
      >
        <IHome size={u(15)} />
      </span>
      <div
        style={{
          position: "absolute",
          left: u(12),
          right: u(12),
          bottom: u(12),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: u(8),
          background: "rgba(255,255,255,0.94)",
          borderRadius: u(999),
          padding: `${u(7)} ${u(13)}`,
          fontSize: u(11),
          fontWeight: 700,
          color: C.primary,
          boxShadow: `0 ${u(12)} ${u(30)} rgba(4,31,34,0.16)`,
        }}
      >
        <span>Vision locked</span>
        <span style={{ color: C.accent }}>Detached ADU</span>
      </div>
    </div>
  );
}

// (b) Teal "3+ Planning tools connected"
function CardTools() {
  return (
    <div
      style={{
        position: "relative",
        height: u(160),
        borderRadius: u(12),
        overflow: "hidden",
        transform: "rotate(1.2deg)",
        background: C.primary,
        color: C.white,
        padding: u(16),
        boxShadow: cardShadow,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,rgba(7,63,66,0.35) 0%,rgba(7,63,66,0.98) 100%)",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: u(12),
          right: u(12),
          width: u(26),
          height: u(26),
          borderRadius: "50%",
          background: C.lime,
          color: C.primary,
          display: "grid",
          placeItems: "center",
          boxShadow: `0 ${u(10)} ${u(22)} rgba(4,31,34,0.18)`,
          animation: "adup-float 3.4s ease-in-out infinite",
        }}
      >
        <ICheck size={u(13)} />
      </span>
      <div style={{ position: "relative", display: "flex", gap: u(6) }}>
        {[IMap, IHome, IFile].map((Ic, i) => (
          <span
            key={i}
            style={{
              width: u(24),
              height: u(24),
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)",
              color: C.lime,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Ic size={u(12)} />
          </span>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: u(31), fontWeight: 700, lineHeight: 1 }}>3+</div>
        <div
          style={{
            marginTop: u(8),
            fontSize: u(11.5),
            lineHeight: 1.4,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          Planning tools connected
        </div>
      </div>
    </div>
  );
}

// (c) White "Typical Project Range $180K+" + "+24%" + bar chart
function CardRange() {
  return (
    <div
      style={{
        position: "relative",
        height: u(130),
        borderRadius: u(12),
        overflow: "hidden",
        transform: "rotate(-1.4deg)",
        background: C.white,
        border: `1px solid ${C.border}`,
        padding: u(15),
        boxShadow: `0 ${u(22)} ${u(50)} rgba(4,31,34,0.14)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: u(38),
          background:
            "linear-gradient(90deg,rgba(13,70,72,0.08),rgba(212,255,177,0.5))",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            background: C.lime,
            color: C.primary,
            borderRadius: u(7),
            padding: u(5),
            display: "grid",
            placeItems: "center",
          }}
        >
          <ICalc size={u(15)} />
        </span>
        <span
          style={{
            fontSize: u(10.5),
            fontWeight: 700,
            color: C.success,
            animation: "adup-pulse 2.4s ease-in-out infinite",
          }}
        >
          +24%
        </span>
      </div>
      <div
        style={{
          position: "relative",
          marginTop: u(11),
          fontSize: u(10),
          color: C.muted,
        }}
      >
        Typical Project Range
      </div>
      <div
        style={{
          position: "relative",
          marginTop: u(3),
          fontSize: u(25),
          fontWeight: 700,
          lineHeight: 1,
          color: C.ink,
        }}
      >
        $180K+
      </div>
      <div
        style={{
          position: "relative",
          marginTop: u(4),
          fontSize: u(9.5),
          color: C.subtle,
        }}
      >
        based on ADU inputs
      </div>
      <div
        style={{
          position: "absolute",
          right: u(14),
          bottom: u(12),
          display: "flex",
          alignItems: "flex-end",
          gap: u(4),
          height: u(28),
        }}
      >
        {[14, 22, 11, 26].map((h, i) => (
          <span
            key={i}
            style={{
              width: u(5),
              height: u(h),
              borderRadius: u(999),
              background: "rgba(7,63,66,0.75)",
              transformOrigin: "bottom",
              animation: `adup-bar 2.8s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// (e) Deep-teal with 3 progress bars "Cost / Loan / ROI"
function CardMeters() {
  const rows: [string, string][] = [
    ["Cost", "adup-fillA"],
    ["Loan", "adup-fillB"],
    ["ROI", "adup-fillC"],
  ];
  return (
    <div
      style={{
        position: "relative",
        height: u(214),
        borderRadius: u(12),
        overflow: "hidden",
        transform: "rotate(1deg)",
        background: C.primary,
        color: C.white,
        padding: u(16),
        boxShadow: cardShadow,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,rgba(7,63,66,0.55) 0%,rgba(7,63,66,0.95) 100%)",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: u(14),
          right: u(14),
          width: u(26),
          height: u(26),
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          color: C.lime,
          display: "grid",
          placeItems: "center",
          animation: "adup-float 4s ease-in-out infinite",
        }}
      >
        <IArrow size={u(13)} />
      </span>
      <div style={{ position: "relative", color: C.lime }}>
        <IWrench size={u(19)} />
      </div>
      <div
        style={{
          position: "relative",
          marginTop: u(15),
          display: "flex",
          flexDirection: "column",
          gap: u(9),
        }}
      >
        {rows.map(([label, anim], i) => (
          <div
            key={label}
            style={{
              display: "grid",
              gridTemplateColumns: `${u(30)} 1fr`,
              alignItems: "center",
              gap: u(8),
            }}
          >
            <span
              style={{
                fontSize: u(10),
                fontWeight: 600,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {label}
            </span>
            <span
              style={{
                height: u(6),
                borderRadius: u(999),
                background: "rgba(255,255,255,0.12)",
                overflow: "hidden",
                display: "block",
              }}
            >
              <span
                style={{
                  display: "block",
                  height: "100%",
                  borderRadius: u(999),
                  background: C.lime,
                  width: "60%",
                  animation: `${anim} 4s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: u(16),
          right: u(16),
          bottom: u(14),
          fontSize: u(12),
          lineHeight: 1.35,
          fontWeight: 600,
        }}
      >
        Make clearer build decisions before work begins
      </div>
    </div>
  );
}

// (d) Lime "10+ Inputs shape each report"
function CardInputs() {
  return (
    <div
      style={{
        position: "relative",
        height: u(160),
        borderRadius: u(12),
        overflow: "hidden",
        transform: "rotate(-1.2deg)",
        background: C.lime,
        color: C.primary,
        padding: u(16),
        boxShadow: softShadow,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: u(56),
          background: "linear-gradient(180deg,transparent,rgba(255,255,255,0.5))",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: u(12),
          right: u(12),
          width: u(26),
          height: u(26),
          borderRadius: "50%",
          background: C.primary,
          color: C.lime,
          display: "grid",
          placeItems: "center",
          animation: "adup-float 4.4s ease-in-out infinite",
        }}
      >
        <ISparkle size={u(13)} />
      </span>
      <div style={{ position: "relative", fontSize: u(31), fontWeight: 700, lineHeight: 1 }}>
        10+
      </div>
      <div
        style={{
          position: "relative",
          marginTop: u(8),
          fontSize: u(11.5),
          lineHeight: 1.4,
          color: "rgba(7,63,66,0.72)",
          maxWidth: u(118),
        }}
      >
        Inputs shape each report
      </div>
      <div
        style={{
          position: "absolute",
          right: u(12),
          bottom: u(12),
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: u(6),
        }}
      >
        {[IMap, IHome, IFile, ILine].map((Ic, i) => (
          <span
            key={i}
            style={{
              width: u(26),
              height: u(26),
              borderRadius: u(7),
              background: "rgba(255,255,255,0.82)",
              color: C.primary,
              display: "grid",
              placeItems: "center",
              boxShadow: `0 ${u(8)} ${u(18)} rgba(4,31,34,0.1)`,
              animation: `adup-float ${3.6 + i * 0.2}s ease-in-out ${i * 0.15}s infinite`,
            }}
          >
            <Ic size={u(13)} />
          </span>
        ))}
      </div>
    </div>
  );
}

const KEYFRAMES = `
.adup-root *{box-sizing:border-box}
@keyframes adup-travel{0%{left:2%}50%{left:92%}100%{left:2%}}
@keyframes adup-dotpulse{0%,100%{opacity:.4}50%{opacity:.92}}
@keyframes adup-bar{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.32)}}
@keyframes adup-fillA{0%,100%{width:52%}50%{width:66%}}
@keyframes adup-fillB{0%,100%{width:62%}50%{width:78%}}
@keyframes adup-fillC{0%,100%{width:72%}50%{width:86%}}
@keyframes adup-pulse{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes adup-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12%)}}
@media (prefers-reduced-motion: reduce){.adup-root *{animation:none!important}}
`;

export function AduPortalShowcase() {
  return (
    <div
      className="adup-root absolute inset-0 overflow-hidden"
      aria-hidden="true"
      style={
        {
          containerType: "inline-size",
          background: C.white,
          color: C.ink,
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        } as CSSProperties
      }
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* Soft radial glow overlay: lime (left) + faint teal (right) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(circle at 18% 40%, rgba(212,255,177,0.44), transparent ${u(
            208
          )}), radial-gradient(circle at 88% 38%, rgba(13,70,72,0.06), transparent ${u(
            192
          )})`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: `0 ${u(44)}`,
          gap: u(30),
        }}
      >
        {/* Floating decorative mini-badges in the side gutters */}
        <span
          style={{
            position: "absolute",
            top: "30%",
            left: u(46),
            width: u(34),
            height: u(34),
            borderRadius: "50%",
            background: C.white,
            color: C.primary,
            display: "grid",
            placeItems: "center",
            boxShadow: `0 ${u(14)} ${u(30)} rgba(4,31,34,0.12)`,
            zIndex: 1,
            animation: "adup-float 5s ease-in-out infinite",
          }}
        >
          <IArrow size={u(15)} />
        </span>
        <span
          style={{
            position: "absolute",
            top: "25%",
            right: u(64),
            width: u(34),
            height: u(34),
            borderRadius: "50%",
            background: C.white,
            color: C.accent,
            display: "grid",
            placeItems: "center",
            boxShadow: `0 ${u(14)} ${u(30)} rgba(4,31,34,0.12)`,
            zIndex: 1,
            animation: "adup-float 5.6s ease-in-out 0.4s infinite",
          }}
        >
          <ILine size={u(15)} />
        </span>

        {/* Centered lockup */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: u(760),
          }}
        >
          <h1
            style={
              {
                margin: 0,
                fontSize: u(42),
                lineHeight: 1.08,
                fontWeight: 700,
                letterSpacing: u(-0.5),
                color: C.ink,
                maxWidth: u(700),
                textWrap: "balance",
              } as CSSProperties
            }
          >
            Plan Your ADU with Clear Cost, Financing, and ROI Insight
          </h1>
          <p
            style={{
              margin: 0,
              marginTop: u(18),
              fontSize: u(15),
              lineHeight: 1.55,
              color: C.muted,
              maxWidth: "46ch",
            }}
          >
            Estimate construction cost, screen loan readiness, and model rental
            returns before you spend on design, bids, or financing.
          </p>
          <div
            style={{
              marginTop: u(26),
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: u(12),
            }}
          >
            <span style={pill(C.primary, C.white)}>Get My Free ADU Estimate</span>
            <span style={pill(C.white, C.ink, C.border)}>Explore All Tools</span>
            <span style={pill(C.lime, C.primary)}>What is an ADU?</span>
          </div>
          <p
            style={{
              margin: 0,
              marginTop: u(15),
              fontSize: u(11.5),
              color: C.muted,
            }}
          >
            No contractor calls. Free personalized planning report.
          </p>
          <div
            style={{
              marginTop: u(13),
              display: "flex",
              alignItems: "center",
              gap: u(7),
              fontSize: u(11.5),
              color: C.muted,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                gap: u(1.5),
                color: C.amber,
              }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <IStar key={i} size={u(13)} />
              ))}
            </span>
            <span>
              <strong style={{ color: C.ink }}>5.0</strong> planning experience
              from homeowner workflows
            </span>
          </div>
        </div>

        {/* Signature "planning cockpit" bento */}
        <div style={{ position: "relative", width: u(1080), maxWidth: "100%" }}>
          {/* Horizontal gradient connector line + traveling lime dot */}
          <div
            style={{
              position: "absolute",
              left: u(28),
              right: u(28),
              top: "50%",
              height: u(2),
              transform: "translateY(-50%)",
              background:
                "linear-gradient(90deg,transparent,rgba(13,70,72,0.18),rgba(47,154,128,0.4),rgba(13,70,72,0.18),transparent)",
              zIndex: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "50%",
                marginTop: u(-3),
                left: "2%",
                marginLeft: u(-35),
                width: u(70),
                height: u(6),
                borderRadius: u(999),
                background: C.lime,
                filter: `blur(${u(3)})`,
                boxShadow: `0 0 ${u(18)} rgba(219,255,194,0.9)`,
                animation:
                  "adup-travel 7s ease-in-out infinite, adup-dotpulse 2.6s ease-in-out infinite",
              }}
            />
          </div>

          {/* Frosted white tray */}
          <div
            style={
              {
                position: "relative",
                zIndex: 1,
                display: "grid",
                gridTemplateColumns: "1fr 0.72fr 1fr 0.72fr 1fr",
                gap: u(18),
                alignItems: "end",
                background: "rgba(255,255,255,0.58)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.6)",
                borderRadius: u(14),
                padding: u(18),
                boxShadow: `0 ${u(30)} ${u(70)} rgba(4,31,34,0.12)`,
              } as CSSProperties
            }
          >
            <CardVision />
            <CardTools />
            <CardRange />
            <CardMeters />
            <CardInputs />
          </div>
        </div>
      </div>
    </div>
  );
}
