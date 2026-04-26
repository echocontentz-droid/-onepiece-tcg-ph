import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, theme } from "../theme";
import { GoldText } from "../components/HoloText";
import { Pillar } from "../components/Pillar";

export const Welcome: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18, mass: 0.9 } });
  const exit = interpolate(frame, [95, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fade = enter * exit;
  const lift = interpolate(enter, [0, 1], [40, 0]);

  const pillarFade = interpolate(frame, [40, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        opacity: fade,
        transform: `translateY(${lift}px)`,
        gap: 28,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 18,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: theme.gold,
          padding: "10px 22px",
          borderRadius: 999,
          border: `1px solid ${theme.gold}`,
          background: "rgba(255, 215, 0, 0.06)",
        }}
      >
        Closed Beta · Demo · Philippines
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 96,
          lineHeight: 1,
          letterSpacing: -2,
        }}
      >
        <GoldText>Cardhaus PH</GoldText>
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 168,
          lineHeight: 1,
          letterSpacing: -4,
          color: theme.fg,
          marginTop: -8,
        }}
      >
        Welcome, Collector.
      </div>

      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 18,
          letterSpacing: 5,
          textTransform: "uppercase",
          color: theme.fgDim,
          marginTop: 4,
        }}
      >
        The live-auction marketplace for PH collectors.
      </div>

      <div
        style={{
          marginTop: 28,
          display: "flex",
          gap: 16,
          opacity: pillarFade,
          transform: `translateY(${(1 - pillarFade) * 12}px)`,
        }}
      >
        <Pillar label="Anti-snipe" dot={theme.holoB} />
        <Pillar label="Auto-bid" dot={theme.gold} />
        <Pillar label="Verified sellers" dot={theme.ok} />
      </div>
    </AbsoluteFill>
  );
};
