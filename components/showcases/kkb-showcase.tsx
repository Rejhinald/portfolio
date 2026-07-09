// Faithful visual recreation of KKB — Kanya-Kanyang Bayad (kkb-three.vercel.app),
// a neobrutalism bill-splitting app. Server component, self-contained, no external
// assets. Sizes are expressed as a share of the container width (cqw) so the mock
// scales with whatever box it fills; designed against a ~1200x750 canvas.

export function KkbShowcase() {
  const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

  // design px -> container-width share (1200px canvas === 100cqw)
  const S = (n: number) => `${(n / 12).toFixed(3)}cqw`;

  const INK = "#1a1a1a";
  const CARD = "#faf9f4";
  const BLUE = "#2f6bf5";
  const MUTED = "rgba(26,26,26,0.55)";
  const PLACEHOLDER = "rgba(26,26,26,0.42)";

  const border = `${S(2)} solid ${INK}`;
  const radius = S(5);
  const shadow = `${S(4)} ${S(4)} 0 0 ${INK}`;

  // shared neobrutalism surface: off-white fill, hard 2px border, offset shadow
  const neo = {
    background: CARD,
    border,
    borderRadius: radius,
    boxShadow: shadow,
    boxSizing: "border-box",
  } as const;

  const quick = [
    { label: "+₱500", bg: "#f2e017" },
    { label: "+₱1,000", bg: "#ff77b4" },
    { label: "+₱1,500", bg: "#34dd88" },
    { label: "+₱2,000", bg: "#ffa64d" },
  ];

  return (
    <div
      className="absolute inset-0"
      style={{
        background: "#d4dde8",
        containerType: "size",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: FONT,
        color: INK,
      }}
    >
      <style>{`
        @keyframes kkbPress {
          0%, 68%, 100% { transform: translate(0, 0); box-shadow: ${shadow}; }
          84% { transform: translate(${S(4)}, ${S(4)}); box-shadow: 0 0 0 0 ${INK}; }
        }
        .kkb-cta { animation: kkbPress 3.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .kkb-cta { animation: none; } }
      `}</style>

      <div
        style={{
          width: S(440),
          display: "flex",
          flexDirection: "column",
          gap: S(15),
        }}
      >
        {/* Wordmark */}
        <div style={{ textAlign: "center", marginBottom: S(2) }}>
          <div
            style={{
              fontSize: S(82),
              fontWeight: 900,
              letterSpacing: S(-3),
              lineHeight: 1,
              color: INK,
            }}
          >
            KKB
          </div>
          <div
            style={{
              fontSize: S(15),
              fontWeight: 600,
              letterSpacing: S(2),
              color: MUTED,
              marginTop: S(8),
            }}
          >
            Kanya-Kanyang Bayad
          </div>
        </div>

        {/* Bill name input */}
        <div
          style={{
            ...neo,
            height: S(46),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: `0 ${S(14)}`,
          }}
        >
          <span style={{ fontSize: S(14), fontWeight: 700, color: MUTED }}>
            Bill name (e.g., Lunch at Jollibee)
          </span>
        </div>

        {/* Total Bill Amount card */}
        <div
          style={{
            ...neo,
            padding: S(16),
            display: "flex",
            flexDirection: "column",
            gap: S(12),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: S(14), fontWeight: 500 }}>
              Total Bill Amount
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: S(4),
                fontSize: S(12.5),
                fontWeight: 700,
                color: BLUE,
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                style={{ width: S(15), height: S(15), flexShrink: 0 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Calc
            </span>
          </div>

          {/* Peso amount field */}
          <div
            style={{
              ...neo,
              height: S(56),
              display: "flex",
              alignItems: "center",
              gap: S(8),
              padding: `0 ${S(14)}`,
            }}
          >
            <span style={{ fontSize: S(24), fontWeight: 700, color: INK }}>₱</span>
            <span
              style={{ fontSize: S(24), fontWeight: 700, color: PLACEHOLDER }}
            >
              0.00
            </span>
          </div>

          {/* Quick amount buttons */}
          <div style={{ display: "flex", gap: S(8) }}>
            {quick.map((q) => (
              <div
                key={q.label}
                style={{
                  ...neo,
                  background: q.bg,
                  flex: 1,
                  height: S(38),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: S(13.5),
                  fontWeight: 700,
                  color: "#000",
                }}
              >
                {q.label}
              </div>
            ))}
          </div>
        </div>

        {/* People section */}
        <div style={{ display: "flex", flexDirection: "column", gap: S(8) }}>
          <div style={{ fontSize: S(19), fontWeight: 700 }}>People</div>
          <div style={{ fontSize: S(13), color: MUTED }}>
            Add people to split the bill with
          </div>
          <div style={{ display: "flex", gap: S(10), marginTop: S(2) }}>
            <div
              style={{
                ...neo,
                flex: 1,
                height: S(46),
                display: "flex",
                alignItems: "center",
                padding: `0 ${S(14)}`,
                fontSize: S(14),
                color: MUTED,
              }}
            >
              Enter name...
            </div>
            <div
              className="kkb-cta"
              style={{
                background: BLUE,
                border,
                borderRadius: radius,
                boxShadow: shadow,
                boxSizing: "border-box",
                height: S(46),
                display: "flex",
                alignItems: "center",
                padding: `0 ${S(22)}`,
                fontSize: S(14.5),
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Add
            </div>
          </div>
        </div>

        {/* Current / History tabs */}
        <div style={{ display: "flex", gap: S(10) }}>
          <div
            style={{
              ...neo,
              background: "#34dd88",
              flex: 1,
              height: S(44),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: S(14.5),
              fontWeight: 700,
              color: "#000",
            }}
          >
            Current
          </div>
          <div
            style={{
              ...neo,
              background: "#b675ff",
              flex: 1,
              height: S(44),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: S(14.5),
              fontWeight: 700,
              color: "#fff",
            }}
          >
            History (3)
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontSize: S(11),
            color: "rgba(26,26,26,0.4)",
            marginTop: S(2),
          }}
        >
          KKB - Kanya-Kanyang Bayad | Rejhinald © 2026
        </div>
      </div>
    </div>
  );
}
