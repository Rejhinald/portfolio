// Faithful visual recreation of Daily Learnings (daily-learnings.vercel.app) —
// a minimal light learning journal: sidebar nav, serif headline, lesson feed
// with a syntax-highlighted card, progress sidebar. Server component,
// self-contained, cqw-scaled against a ~1200x750 canvas.

const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = 'ui-monospace, "Cascadia Code", Consolas, monospace';

const BG = "#f7f7f5";
const CARD = "#ffffff";
const BORDER = "#e7e5e1";
const INK = "#1c1917";
const MUTED = "#78716c";
const BLUE = "#2563eb";
const BLUE_SOFT = "#eff6ff";

// design px -> container-width share (1200px canvas === 100cqw)
const S = (n: number) => `${(n / 12).toFixed(3)}cqw`;

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: `1px solid ${BORDER}`,
        padding: `${S(7)} 0`,
        fontSize: S(12.5),
      }}
    >
      <span style={{ color: MUTED }}>{label}</span>
      <span style={{ fontWeight: 700, color: INK }}>{value}</span>
    </div>
  );
}

function Chip({ text, mono = true }: { text: string; mono?: boolean }) {
  return (
    <span
      style={{
        background: "#f1f0ee",
        border: `1px solid ${BORDER}`,
        borderRadius: S(5),
        padding: `${S(4)} ${S(9)}`,
        fontSize: S(11),
        fontFamily: mono ? MONO : FONT,
        color: "#44403c",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

export function DailyLearningsShowcase() {
  const nav = ["Home", "Topics", "Projects", "Glossary", "About"];
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: BG, containerType: "inline-size", fontFamily: FONT, color: INK }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${S(14)} ${S(24)}`,
          borderBottom: `1px solid ${BORDER}`,
          background: CARD,
        }}
      >
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: S(19) }}>
          Daily Learnings
        </span>
        <span style={{ display: "flex", gap: S(10) }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: S(22),
                height: S(22),
                borderRadius: S(5),
                border: `1px solid ${BORDER}`,
                background: i === 1 ? "#f1f0ee" : CARD,
              }}
            />
          ))}
        </span>
      </div>

      <div style={{ display: "flex", gap: S(22), padding: `${S(20)} ${S(24)}` }}>
        {/* Left sidebar */}
        <div style={{ width: S(200), flexShrink: 0 }}>
          {nav.map((n, i) => (
            <div
              key={n}
              style={{
                padding: `${S(9)} ${S(12)}`,
                borderRadius: S(7),
                marginBottom: S(3),
                fontSize: S(13.5),
                fontWeight: i === 0 ? 700 : 500,
                color: i === 0 ? BLUE : "#57534e",
                background: i === 0 ? BLUE_SOFT : "transparent",
              }}
            >
              {n}
            </div>
          ))}
          <div
            style={{
              marginTop: S(14),
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: S(9),
              padding: S(13),
            }}
          >
            <div style={{ fontSize: S(10.5), letterSpacing: "0.12em", color: MUTED, fontWeight: 700 }}>
              🔥 STREAK
            </div>
            <div style={{ fontSize: S(26), fontWeight: 800, marginTop: S(4) }}>
              1 <span style={{ fontSize: S(12.5), fontWeight: 500, color: MUTED }}>day</span>
            </div>
            <div style={{ fontSize: S(11), color: MUTED, marginTop: S(4), lineHeight: 1.5 }}>
              2 lessons published, ending 2026-07-25.
            </div>
          </div>
        </div>

        {/* Main column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: SERIF,
              fontWeight: 700,
              fontSize: S(31),
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
            }}
          >
            One concept a day, taken from real production code
          </h1>
          <p style={{ margin: `${S(10)} 0 0`, fontSize: S(13.5), color: MUTED, lineHeight: 1.6 }}>
            Every evening, one decision from my own repositories gets pulled apart and
            explained from first principles — generalised, never copied.
          </p>

          {/* Search + filters */}
          <div
            style={{
              marginTop: S(14),
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: S(9),
              padding: S(12),
            }}
          >
            <div
              style={{
                border: `1px solid ${BORDER}`,
                borderRadius: S(7),
                padding: `${S(9)} ${S(12)}`,
                fontSize: S(12.5),
                color: "#a8a29e",
                background: BG,
              }}
            >
              🔍 Search titles, concepts and code
            </div>
            <div style={{ display: "flex", gap: S(7), marginTop: S(9), alignItems: "center" }}>
              <span style={{ fontSize: S(10.5), letterSpacing: "0.1em", color: MUTED, fontWeight: 700 }}>
                FILTER
              </span>
              <Chip text="beginner" />
              <Chip text="intermediate" />
            </div>
          </div>

          {/* Lesson card */}
          <div
            style={{
              marginTop: S(14),
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderLeft: `${S(3)} solid ${BLUE}`,
              borderRadius: S(9),
              padding: S(16),
            }}
          >
            <div style={{ display: "flex", gap: S(8), alignItems: "center", fontSize: S(10.5), letterSpacing: "0.1em", color: MUTED, fontFamily: MONO }}>
              LESSON 002 · JULY 25, 2026
              <span
                style={{
                  background: BLUE_SOFT,
                  color: BLUE,
                  borderRadius: S(4),
                  padding: `${S(2)} ${S(6)}`,
                  fontWeight: 700,
                }}
              >
                LATEST
              </span>
            </div>
            <div style={{ fontSize: S(11.5), color: MUTED, marginTop: S(8) }}>
              📁 Internal marketing and lead-capture platform · TypeScript
            </div>
            <h2
              style={{
                margin: `${S(8)} 0 0`,
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: S(19),
                lineHeight: 1.3,
              }}
            >
              When Your Safety Check Breaks, Which Way Does It Fail?
            </h2>
            <p style={{ margin: `${S(8)} 0 0`, fontSize: S(12.5), color: "#44403c", lineHeight: 1.6 }}>
              A token service hiccups for thirty seconds, and for thirty seconds the admin
              dashboard has no lock on it at all. Nothing crashes, nothing alerts.
            </p>
            {/* Code block */}
            <div
              style={{
                marginTop: S(11),
                border: `1px solid ${BORDER}`,
                borderRadius: S(7),
                overflow: "hidden",
                fontFamily: MONO,
                fontSize: S(11),
              }}
            >
              <div
                style={{
                  background: "#f1f0ee",
                  padding: `${S(6)} ${S(11)}`,
                  letterSpacing: "0.1em",
                  color: MUTED,
                  fontSize: S(10),
                }}
              >
                TYPESCRIPT
              </div>
              <div style={{ padding: S(11), background: "#fbfaf9", lineHeight: 1.7 }}>
                <div>
                  <span style={{ color: "#dc2626" }}>type</span>{" "}
                  <span style={{ color: BLUE }}>Handler</span> = (req:{" "}
                  <span style={{ color: BLUE }}>Request</span>) =&gt;{" "}
                  <span style={{ color: BLUE }}>Promise</span>&lt;Response&gt;;
                </div>
                <div style={{ color: "#a16207" }}>
                  {"// PROTECTS something → fail CLOSED."}
                </div>
                <div style={{ color: "#a16207" }}>
                  {"// If the check cannot run, assume the worst and refuse."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ width: S(250), flexShrink: 0 }}>
          <div
            style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: S(9),
              padding: S(13),
            }}
          >
            <div style={{ fontSize: S(10.5), letterSpacing: "0.12em", color: MUTED, fontWeight: 700, marginBottom: S(4) }}>
              PROGRESS
            </div>
            <StatRow label="Lessons" value="2" />
            <StatRow label="Reading time" value="15m" />
            <StatRow label="Topics" value="10" />
            <StatRow label="Languages" value="1" />
            <StatRow label="Longest streak" value="1d" />
          </div>
          <div
            style={{
              marginTop: S(14),
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: S(9),
              padding: S(13),
            }}
          >
            <div style={{ fontSize: S(10.5), letterSpacing: "0.12em", color: MUTED, fontWeight: 700, marginBottom: S(9) }}>
              RECENTLY COVERED
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: S(6) }}>
              {[
                "Fail-open vs fail-closed",
                "Guards and middleware",
                "Safe defaults",
                "Silent failure",
                "Parse, don't validate",
              ].map((t) => (
                <Chip key={t} text={t} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
