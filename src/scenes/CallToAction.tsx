import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18 } });
  const exit = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;
  const lift = interpolate(enter, [0, 1], [50, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        opacity,
        transform: `translateY(${lift}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 22,
          letterSpacing: 8,
          textTransform: "uppercase",
          color: theme.muted,
          marginBottom: 32,
        }}
      >
        Open beta — try it now
      </div>

      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 110,
          fontWeight: 600,
          color: theme.ink,
          letterSpacing: -2,
          lineHeight: 1,
        }}
      >
        Step inside <span style={{ color: theme.accent }}>Cardhaus</span>.
      </div>

      <div
        style={{
          marginTop: 56,
          padding: "20px 44px",
          borderRadius: 999,
          background: theme.ink,
          color: theme.paper,
          fontFamily: "'Inter', sans-serif",
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: 1,
          boxShadow: "0 24px 50px rgba(11, 11, 15, 0.25)",
        }}
      >
        cardhaus.netlify.app
      </div>
    </AbsoluteFill>
  );
};
