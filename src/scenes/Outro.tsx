import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Logo } from "../components/Logo";
import { theme } from "../theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const drift = interpolate(frame, [0, 90], [0, -10]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.ink,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn,
      }}
    >
      <div style={{ transform: `translateY(${drift}px)` }}>
        <Logo size={120} color={theme.paper} />
      </div>
      <div
        style={{
          marginTop: 28,
          fontFamily: "'Inter', sans-serif",
          fontSize: 20,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: "rgba(250, 250, 247, 0.55)",
        }}
      >
        For the cards you love
      </div>
    </AbsoluteFill>
  );
};
