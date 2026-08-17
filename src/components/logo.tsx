/**
 * The AlgoKabs mark, rebuilt as text + inline SVG rather than a raster asset:
 * it stays crisp at any size, inherits the palette, and the trace can draw
 * itself. The trace is the good idea in the original — a circuit path that is
 * also a price line — so it gets the animation and the wordmark stays still.
 */

const TRACE_LENGTH = 320;

export function Logo({
  size = "md",
  animate = true,
}: {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}) {
  // Tracking is in em so it scales with the font size; the sizes step down far
  // enough that the wordmark still breathes at 375px.
  const scale = {
    sm: { text: "text-sm sm:text-base", track: "0.3em", h: 10 },
    md: { text: "text-xl sm:text-2xl", track: "0.32em", h: 14 },
    lg: { text: "text-[1.45rem] sm:text-4xl md:text-6xl", track: "0.26em", h: 26 },
  }[size];

  return (
    <span className="inline-flex flex-col items-stretch select-none">
      <span
        className={`font-[family-name:var(--font-josefin)] font-light ${scale.text} text-gold-gradient leading-none`}
        style={{ letterSpacing: scale.track }}
      >
        ALGOKABS
      </span>

      <svg
        viewBox="0 0 300 20"
        height={scale.h}
        className="mt-1 w-full overflow-visible"
        fill="none"
        aria-hidden="true"
      >
        {/* circuit trace / price line */}
        <path
          d="M8 7 H118 L140 15 H160 L182 7 H292"
          stroke="var(--sage)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animate ? "trace-path" : undefined}
          style={
            animate
              ? ({ "--len": TRACE_LENGTH } as React.CSSProperties)
              : undefined
          }
        />
        {[
          { cx: 8, cy: 7, delay: 1.5 },
          { cx: 150, cy: 15, delay: 1.05 },
          { cx: 292, cy: 7, delay: 1.75 },
        ].map((n) => (
          <circle
            key={n.cx}
            cx={n.cx}
            cy={n.cy}
            r="3.4"
            stroke="var(--sage)"
            strokeWidth="1.75"
            fill="var(--bg)"
            className={animate ? "trace-node" : undefined}
            style={
              animate
                ? ({ animationDelay: `${n.delay}s` } as React.CSSProperties)
                : { opacity: 1 }
            }
          />
        ))}
      </svg>
    </span>
  );
}

/**
 * Compact one-line version for headers and tight spaces. `textFrom` controls
 * the breakpoint at which the wordmark appears — the header needs the icon
 * alone on small phones or the nav wraps onto two rows.
 */
export function LogoMark({
  className = "",
  textFrom = "always",
}: {
  className?: string;
  textFrom?: "always" | "sm";
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 28 28" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M2 16 H9 L13 22 H15 L19 10 H26"
          stroke="var(--gold)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="2" cy="16" r="2" fill="var(--sage)" />
        <circle cx="26" cy="10" r="2" fill="var(--sage)" />
      </svg>
      <span
        className={`font-[family-name:var(--font-josefin)] text-sm font-light tracking-[0.28em] text-gold-gradient ${
          textFrom === "sm" ? "hidden sm:inline" : ""
        }`}
      >
        ALGOKABS
      </span>
    </span>
  );
}
