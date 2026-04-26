import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, theme } from "../theme";
import { GoldText } from "../components/HoloText";
import { Pillar } from "../components/Pillar";
import { useLayout } from "../useLayout";

export const Welcome: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

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
        gap: L.vertical ? 22 : 28,
        padding: `0 ${L.paddingX}px`,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: L.eyebrow.fontSize + 2,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: theme.gold,
          padding: "10px 20px",
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
          fontSize: L.vertical ? 72 : 96,
          lineHeight: 1,
          letterSpacing: -2,
        }}
      >
        <GoldText>Cardhaus PH</GoldText>
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: L.headlineHero,
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
          fontSize: L.eyebrow.fontSize + 2,
          letterSpacing: 5,
          textTransform: "uppercase",
          color: theme.fgDim,
          marginTop: 4,
          maxWidth: L.vertical ? 880 : 1400,
        }}
      >
        The live-auction marketplace for PH collectors.
      </div>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          justifyContent: "center",
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
