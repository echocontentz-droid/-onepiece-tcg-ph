import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, theme } from "../theme";
import { PhoneMock } from "../components/PhoneMock";

export const Handoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  return (
    <AbsoluteFill
      style={{
        opacity,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 120,
        paddingLeft: 140,
        paddingRight: 140,
      }}
    >
      <div
        style={{
          transform: `translate(${phoneShift}px, ${float}px) rotate(2deg)`,
        }}
      >
        <PhoneMock src="screenshots/handoff.jpg" height={880} />
      </div>

      <div
        style={{
          flex: 1,
          maxWidth: 880,
          transform: `translateX(${textShift}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 16,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: theme.ok,
            marginBottom: 28,
          }}
        >
          ✓ Verified handoff
        </div>

        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 130,
            lineHeight: 1,
            letterSpacing: -3,
            color: theme.fg,
          }}
        >
          Deals that close.
        </div>

        <div
          style={{
            marginTop: 32,
            fontFamily: fonts.sans,
            fontSize: 28,
            lineHeight: 1.45,
            color: theme.fgDim,
            maxWidth: 700,
          }}
        >
          GCash, meetup, or ship via Lalamove — every step is logged, both parties confirm, and trust gets earned in stars.
        </div>

        <div
          style={{
            marginTop: 32,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            opacity: checkFade,
          }}
        >
          {["Payment confirmed", "Photo before shipping", "Marked received", "Both parties rated"].map((step, i) => (
            <span
              key={i}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: `1px solid rgba(138, 255, 193, 0.3)`,
                background: "rgba(138, 255, 193, 0.06)",
                color: theme.ok,
                fontFamily: fonts.mono,
                fontSize: 14,
                letterSpacing: 1.5,
              }}
            >
              ✓ {step}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
