import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, theme } from "../theme";
import { PhoneMock } from "../components/PhoneMock";
import { HoloText } from "../components/HoloText";
import { useLayout } from "../useLayout";

export const Auction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

  const enter = spring({ frame, fps, config: { damping: 22, mass: 0.9 } });
  const exit = interpolate(frame, [155, 180], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;

  const phoneShift = interpolate(enter, [0, 1], [80, 0]);
  const float = Math.sin(frame * 0.06) * 6;

  const textShift = interpolate(enter, [0, 1], [-40, 0]);
  const subFade = interpolate(frame, [40, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pulse = (Math.sin(frame * 0.25) + 1) / 2;
  const triggerFade = interpolate(frame, [85, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phone = (
    <div
      style={{
        transform: `translate(${L.vertical ? 0 : phoneShift}px, ${
          L.vertical ? phoneShift : float
        }px) rotate(${L.vertical ? 0 : -2}deg)`,
      }}
    >
      <PhoneMock src="screenshots/auction.jpg" height={L.phoneHeight} />
    </div>
  );

  const copy = (
    <div
      style={{
        flex: L.vertical ? "0 0 auto" : 1,
        maxWidth: L.contentMaxWidth,
        transform: `translateX(${L.vertical ? 0 : textShift}px)`,
        textAlign: L.textAlign,
        display: "flex",
        flexDirection: "column",
        alignItems: L.align,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 16px",
          borderRadius: 6,
          background: "rgba(255, 84, 112, 0.12)",
          border: `1px solid rgba(255, 84, 112, 0.4)`,
          color: theme.hot,
          fontFamily: fonts.mono,
          fontSize: L.eyebrow.fontSize - 2,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: L.vertical ? 18 : 32,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: theme.hot,
            boxShadow: `0 0 ${8 + pulse * 14}px ${theme.hot}`,
            opacity: 0.5 + pulse * 0.5,
          }}
        />
        Live · 6 lots active
      </div>

      <div
        style={{
          fontFamily: fonts.display,
          fontSize: L.headline,
          lineHeight: 1,
          letterSpacing: -3,
          color: theme.fg,
        }}
      >
        Real bids.
        <br />
        Real <HoloText>collectors</HoloText>.
      </div>

      <div
        style={{
          marginTop: L.vertical ? 18 : 32,
          fontFamily: fonts.sans,
          fontSize: L.body,
          lineHeight: 1.45,
          color: theme.fgDim,
          maxWidth: L.vertical ? 880 : 680,
          opacity: subFade,
        }}
      >
        Watch hammer countdowns. Place bids in ₱.{" "}
        <strong style={{ color: theme.fg, fontWeight: 600 }}>Anti-snipe</strong> extends the timer when bids land late — no last-second steals.
      </div>

      <div
        style={{
          marginTop: L.vertical ? 16 : 28,
          opacity: triggerFade,
          transform: `translateY(${(1 - triggerFade) * 10}px)`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "10px 16px",
            borderRadius: 6,
            border: `1px solid ${theme.holoB}`,
            background: "rgba(0, 229, 255, 0.08)",
            color: theme.holoB,
            fontFamily: fonts.mono,
            fontSize: L.eyebrow.fontSize - 2,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          🛡 Anti-snipe triggered · extended to 5:00
        </span>
      </div>
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        flexDirection: L.flexDir,
        alignItems: "center",
        justifyContent: "center",
        gap: L.gap,
        paddingLeft: L.paddingX,
        paddingRight: L.paddingX,
      }}
    >
      {L.vertical ? phone : copy}
      {L.vertical ? copy : phone}
    </AbsoluteFill>
  );
};
