import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Logo } from "../components/Logo";
import { theme } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reveal = spring({ frame, fps, config: { damping: 18, mass: 0.9 } });
  const scale = interpolate(reveal, [0, 1], [0.85, 1]);
  const opacity = interpolate(reveal, [0, 1], [0, 1]);
  const exitOpacity = interpolate(frame, [90, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: opacity * exitOpacity,
        transform: `scale(${scale})`,
      }}
    >
      <Logo size={140} color={theme.ink} />
      <div
        style={{
          marginTop: 28,
          fontFamily: "'Inter', sans-serif",
          fontSize: 22,
          letterSpacing: 8,
          textTransform: "uppercase",
          color: theme.muted,
        }}
      >
        For the cards you love
      </div>
    </AbsoluteFill>
  );
};
