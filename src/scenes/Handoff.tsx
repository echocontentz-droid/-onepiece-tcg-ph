import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, theme } from "../theme";
import { PhoneMock } from "../components/PhoneMock";
import { useLayout } from "../useLayout";

export const Handoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

  const enter = spring({ frame, fps, config: { damping: 22 } });
  const exit = interpolate(frame, [95, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;

  const float = Math.sin(frame * 0.06 + 3) * 6;
  const phoneShift = interpolate(enter, [0, 1], [-80, 0]);
  const textShift = interpolate(enter, [0, 1], [40, 0]);

  const checkFade = interpolate(frame, [50, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phone = (
    <div
      style={{
        transform: `translate(${L.vertical ? 0 : phoneShift}px, ${
          L.vertical ? phoneShift : float
        }px) rotate(${L.vertical ? 0 : 2}deg)`,
      }}
    >
      <PhoneMock src="screenshots/handoff.jpg" height={L.phoneHeight} />
    </div>
  );

  const copy = (
    <div
      style={{
        flex: L.vertical ? "0 0 auto" : 1,
        maxWidth: L.contentMaxWidth,
        transform: `translateX(${L.vertical ? 0 : textShift}px)`,
        textAlign: L.textAlign,
        display: "flex",
        flexDirection: "column",
        alignItems: L.align,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: L.eyebrow.fontSize,
          letterSpacing: 5,
          textTransform: "uppercase",
          color: theme.ok,
          marginBottom: L.vertical ? 16 : 28,
        }}
      >
        ✓ Verified handoff
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: L.headline,
          lineHeight: 1,
          letterSpacing: -3,
          color: theme.fg,
        }}
      >
        Deals that close.
      </div>

      <div
        style={{
          marginTop: L.vertical ? 18 : 32,
          fontFamily: fonts.sans,
          fontSize: L.body,
          lineHeight: 1.45,
          color: theme.fgDim,
          maxWidth: L.vertical ? 880 : 700,
        }}
      >
        GCash, meetup, or ship via Lalamove — every step is logged, both parties confirm, and trust gets earned in stars.
      </div>

      <div
        style={{
          marginTop: L.vertical ? 18 : 32,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: L.vertical ? "center" : "flex-start",
          opacity: checkFade,
        }}
      >
        {["Payment confirmed", "Photo before shipping", "Marked received", "Both parties rated"].map((step, i) => (
          <span
            key={i}
            style={{
              padding: "9px 14px",
              borderRadius: 999,
              border: `1px solid rgba(138, 255, 193, 0.3)`,
              background: "rgba(138, 255, 193, 0.06)",
              color: theme.ok,
              fontFamily: fonts.mono,
              fontSize: L.vertical ? 12 : 14,
              letterSpacing: 1.5,
            }}
          >
            ✓ {step}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        flexDirection: L.flexDir,
        alignItems: "center",
        justifyContent: "center",
        gap: L.gap,
        paddingLeft: L.paddingX,
        paddingRight: L.paddingX,
      }}
    >
      {phone}
      {copy}
    </AbsoluteFill>
  );
};
