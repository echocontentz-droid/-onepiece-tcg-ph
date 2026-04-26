import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, theme } from "../theme";
import { GoldText } from "../components/HoloText";
import { Logo } from "../components/Logo";

export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
        Closed Beta · Invite Only
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 168,
          lineHeight: 1,
          letterSpacing: -4,
          color: theme.fg,
          maxWidth: 1500,
        }}
      >
        Join the <GoldText>Cardhaus</GoldText> beta.
      </div>

      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: 26,
          color: theme.fgDim,
          maxWidth: 900,
          marginTop: 4,
          lineHeight: 1.5,
        }}
      >
        The live-auction marketplace TCG collectors in the Philippines deserve.
      </div>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: buttonFade,
          transform: `scale(${0.92 + buttonScale * 0.08})`,
        }}
      >
        <div
          style={{
            padding: "20px 44px",
            borderRadius: 999,
            background: theme.gold,
            color: "#000",
            fontFamily: fonts.mono,
            fontSize: 28,
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
          marginTop: 32,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: proofFade,
          fontFamily: fonts.mono,
          fontSize: 16,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: theme.fgMuted,
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
          bottom: 60,
          opacity: proofFade,
        }}
      >
        <Logo size={48} color={theme.fg} />
      </div>
    </AbsoluteFill>
  );
};
