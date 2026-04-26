import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

const lines = ["A home", "for trading card", "collectors."];

export const Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [120, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: 200,
        opacity: exit,
      }}
    >
      {lines.map((line, i) => {
        const start = i * 12;
        const slide = interpolate(frame, [start, start + 30], [60, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const fade = interpolate(frame, [start, start + 30], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isAccent = i === lines.length - 1;
        return (
          <div
            key={i}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 140,
              fontWeight: 600,
              lineHeight: 1.05,
              color: isAccent ? theme.accent : theme.ink,
              transform: `translateY(${slide}px)`,
              opacity: fade,
              letterSpacing: -2,
            }}
          >
            {line}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
