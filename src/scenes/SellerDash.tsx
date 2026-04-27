import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, theme } from "../theme";
import { PhoneMock, phoneWidthFromHeight } from "../components/PhoneMock";
import { useLayout } from "../useLayout";

export const SellerDash: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();

  const enter = spring({ frame, fps, config: { damping: 22 } });
  const exit = interpolate(frame, [125, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;

  const float = Math.sin(frame * 0.06 + 2) * 6;
  const phoneShift = interpolate(enter, [0, 1], [80, 0]);
  const textShift = interpolate(enter, [0, 1], [-40, 0]);

  const swap = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phoneWidth = phoneWidthFromHeight(L.phoneHeight);

  const phone = (
    <div
      style={{
        transform: `translate(${L.vertical ? 0 : phoneShift}px, ${
          L.vertical ? phoneShift : float
        }px) rotate(${L.vertical ? 0 : -2}deg)`,
        position: "relative",
        width: phoneWidth,
        height: L.phoneHeight,
      }}
    >
      <div style={{ position: "absolute", inset: 0, opacity: 1 - swap }}>
        <PhoneMock src="screenshots/dashboard.jpg" height={L.phoneHeight} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: swap }}>
        <PhoneMock src="screenshots/analytics.jpg" height={L.phoneHeight} />
      </div>
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
          fontFamily: fonts.mono,
          fontSize: L.eyebrow.fontSize,
          letterSpacing: 5,
          textTransform: "uppercase",
          color: theme.holoC,
          marginBottom: L.vertical ? 16 : 28,
        }}
      >
        ✦ For sellers
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
        Sell with intelligence.
      </div>

      <div
        style={{
          marginTop: L.vertical ? 18 : 32,
          fontFamily: fonts.sans,
          fontSize: L.body,
          lineHeight: 1.45,
          color: theme.fgDim,
          maxWidth: L.vertical ? 880 : 700,
        }}
      >
        Track active lots, bid velocity, watcher counts, sell-rate, and 30-day averages — every listing analyzed.
      </div>

      <div
        style={{
          marginTop: L.vertical ? 22 : 36,
          display: "flex",
          gap: L.vertical ? 24 : 36,
          flexWrap: "wrap",
          justifyContent: L.vertical ? "center" : "flex-start",
        }}
      >
        <Stat label="Sell rate" value="73%" L={L} />
        <Stat label="Avg sold (30d)" value="₱18,200" L={L} />
        <Stat label="Watchers" value="38" L={L} />
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

const Stat: React.FC<{ label: string; value: string; L: ReturnType<typeof useLayout> }> = ({ label, value, L }) => (
  <div>
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: 12,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: theme.fgMuted,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: fonts.display,
        fontSize: L.statValue,
        color: theme.fg,
        lineHeight: 1.1,
        marginTop: 4,
      }}
    >
      {value}
    </div>
  </div>
);
