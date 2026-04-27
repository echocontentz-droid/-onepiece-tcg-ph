import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, theme } from "../theme";
import { GoldText } from "../components/HoloText";
import { Logo } from "../components/Logo";
import { useLayout } from "../useLayout";

const FACEBOOK_BLUE = "#1877F2";

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
        Invite codes go to followers first. Live auctions, anti-snipe protection,
        verified PH sellers — all behind a closed beta.
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
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: L.vertical ? "16px 28px" : "20px 40px",
            borderRadius: 999,
            background: FACEBOOK_BLUE,
            color: "#fff",
            fontFamily: fonts.sans,
            fontSize: L.vertical ? 22 : 28,
            fontWeight: 700,
            letterSpacing: 0.5,
            boxShadow: `0 24px 50px rgba(24, 119, 242, 0.35)`,
          }}
        >
          <FacebookMark size={L.vertical ? 28 : 36} />
          Follow Cardhaus PH for early access
        </div>
      </div>

      <div
        style={{
          marginTop: L.vertical ? 22 : 28,
          fontFamily: fonts.mono,
          fontSize: L.vertical ? 13 : 16,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: theme.fg,
          opacity: buttonFade,
        }}
      >
        @CardhausPH on Facebook
      </div>

      <div
        style={{
          marginTop: L.vertical ? 18 : 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: proofFade,
          fontFamily: fonts.mono,
          fontSize: L.vertical ? 12 : 14,
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

const FacebookMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
    <circle cx="18" cy="18" r="18" fill="#fff" />
    <path
      d="M20.6 19.3h2.7l.4-3.4h-3.1v-2c0-1 .3-1.7 1.7-1.7h1.8V8.8c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v2.5h-3v3.4h3v9h3.5v-9z"
      fill={FACEBOOK_BLUE}
    />
  </svg>
);
