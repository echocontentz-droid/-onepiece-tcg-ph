import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, theme } from "../theme";
import { GoldText } from "../components/HoloText";
import { Logo } from "../components/Logo";
import { useLayout } from "../useLayout";

export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

  const enter = spring({ frame, fps, config: { damping: 18 } });
  const lift = interpolate(enter, [0, 1], [40, 0]);
  const opacity = enter;

  const buttonFade = interpolate(frame, [40, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const buttonScale = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 14 } });

  const proofFade = interpolate(frame, [70, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        opacity,
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
        Closed Beta · Invite Only
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: L.headlineHero,
          lineHeight: 1,
          letterSpacing: -4,
          color: theme.fg,
          maxWidth: L.vertical ? 920 : 1500,
        }}
      >
        Join the <GoldText>Cardhaus</GoldText> beta.
      </div>

      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: L.body - 2,
          color: theme.fgDim,
          maxWidth: L.vertical ? 860 : 900,
          marginTop: 4,
          lineHeight: 1.5,
        }}
      >
        The live-auction marketplace TCG collectors in the Philippines deserve.
      </div>

      <div
        style={{
          marginTop: 18,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: buttonFade,
          transform: `scale(${0.92 + buttonScale * 0.08})`,
        }}
      >
        <div
          style={{
            padding: L.vertical ? "16px 28px" : "20px 44px",
            borderRadius: 999,
            background: theme.gold,
            color: "#000",
            fontFamily: fonts.mono,
            fontSize: L.vertical ? 22 : 28,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            boxShadow: `0 24px 50px rgba(255, 215, 0, 0.25)`,
          }}
        >
          cardhaus.netlify.app →
        </div>
      </div>

      <div
        style={{
          marginTop: L.vertical ? 24 : 32,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: proofFade,
          fontFamily: fonts.mono,
          fontSize: L.vertical ? 13 : 16,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: theme.fgMuted,
          textAlign: "center",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: theme.hot,
            boxShadow: `0 0 12px ${theme.hot}`,
          }}
        />
        247 collectors · One Piece + Pokémon · Philippines
      </div>

      <div
        style={{
          position: "absolute",
          bottom: L.vertical ? 80 : 60,
          opacity: proofFade,
        }}
      >
        <Logo size={L.vertical ? 36 : 48} color={theme.fg} />
      </div>
    </AbsoluteFill>
  );
};
